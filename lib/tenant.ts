import "server-only";

import {
  assertFeatureEnabled,
  createTenantDomainRegistryHttpLoader,
  getRequestHost,
  hasEnabledFeature,
  normalizeHost,
  resolveTenantFromDomain,
  type ResolveTenantFromDomainResult,
} from "@ordo-solution/tenant-core";
import { headers } from "next/headers";

let loaderSingleton: ReturnType<typeof createTenantDomainRegistryHttpLoader> | null = null;
const tenantCache = new Map<string, { value: ResolveTenantFromDomainResult | null; expiresAt: number }>();

const CACHE_TTL_MS = 30_000; // Short TTL for hot paths; admin updates should still propagate quickly.

function getEnv(name: string): string {
  return process.env[name]?.trim() ?? "";
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function getRequiredEnv(name: string): string {
  const value = getEnv(name);
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function getTrustedForwardedHostHeader(): string {
  // Keep default to x-forwarded-host; allow override for specific ingress stacks.
  return getEnv("TENANT_FORWARDED_HOST_HEADER") || "x-forwarded-host";
}

function getTenantLoader() {
  if (!loaderSingleton) {
    loaderSingleton = createTenantDomainRegistryHttpLoader({
      baseUrl: getRequiredEnv("TENANT_REGISTRY_BASE_URL"),
      serviceToken: getRequiredEnv("TENANT_REGISTRY_SERVICE_TOKEN"),
      timeoutMs: 5000,
      maxRetries: 1,
      logger: console,
    });
  }
  return loaderSingleton;
}

function isLocalHost(host: string): boolean {
  const normalized = normalizeHost(host);
  return (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "::1" ||
    normalized === "[::1]"
  );
}

async function buildTenantRequest(): Promise<Request> {
  const incomingHeaders = await headers();
  const requestHeaders = new Headers(incomingHeaders);
  const forwardedHostHeader = getTrustedForwardedHostHeader();
  const resolvedHost = getRequestHost(
    new Request("http://local", { headers: requestHeaders }),
    { forwardedHostHeader }
  );

  // Dev-only convenience fallback: if request host is local, resolve with configured tenant domain.
  // In production we should always trust the incoming host from ingress/DNS.
  const defaultDevDomain = normalizeHost(getEnv("TENANT_DEV_FALLBACK_DOMAIN"));
  if (!isProduction() && defaultDevDomain && isLocalHost(resolvedHost)) {
    requestHeaders.set(forwardedHostHeader, defaultDevDomain);
  }

  // Explicit host override is disabled in production to prevent accidental tenant mixups.
  const explicitOverride = normalizeHost(getEnv("TENANT_DEV_FORCE_DOMAIN"));
  if (!isProduction() && explicitOverride) {
    requestHeaders.set(forwardedHostHeader, explicitOverride);
  }

  return new Request("http://ordo-demo.local", {
    headers: requestHeaders,
  });
}

export async function resolveCurrentTenant(): Promise<ResolveTenantFromDomainResult | null> {
  const request = await buildTenantRequest();
  const cacheHost = getRequestHost(request, {
    forwardedHostHeader: getTrustedForwardedHostHeader(),
  });

  const cacheKey = cacheHost || "__missing-host__";
  const now = Date.now();
  const cached = tenantCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const resolved = await resolveTenantFromDomain(request, getTenantLoader(), {
    forwardedHostHeader: getTrustedForwardedHostHeader(),
  });

  tenantCache.set(cacheKey, {
    value: resolved,
    expiresAt: now + CACHE_TTL_MS,
  });
  return resolved;
}

export async function requireTenant(): Promise<ResolveTenantFromDomainResult> {
  const tenant = await resolveCurrentTenant();
  if (!tenant) {
    throw new Error(
      "Tenant could not be resolved. Check Host header or set TENANT_DEV_FALLBACK_DOMAIN."
    );
  }
  return tenant;
}

export async function requireTenantFeature(
  featureKey: string
): Promise<ResolveTenantFromDomainResult> {
  const tenant = await requireTenant();
  assertFeatureEnabled(tenant.enabledFeatures, featureKey, {
    tenantSlug: tenant.tenant.slug,
  });
  return tenant;
}

export async function getTenantFeatureState(featureKey: string): Promise<boolean> {
  const tenant = await requireTenant();
  return hasEnabledFeature(tenant.enabledFeatures, featureKey);
}