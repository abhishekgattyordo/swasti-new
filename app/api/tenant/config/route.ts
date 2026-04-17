import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tenant = await requireTenant();

    return NextResponse.json({
      host: tenant.host,
      tenant: tenant.tenant,
      enabledFeatures: Array.from(tenant.enabledFeatures),
      configByKey: tenant.configByKey,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to resolve tenant",
      },
      { status: 404 }
    );
  }
}