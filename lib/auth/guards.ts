import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  AccessTokenPayload,
  USER_ROLES,
  UserRole,
  normalizeRole,
  verifyAccessToken,
} from "@/lib/auth/jwt";

export const ALL_USER_ROLES = [...USER_ROLES];

export class AuthError extends Error {
  status: number;
  code: "UNAUTHORIZED" | "FORBIDDEN";

  constructor(
    message: string,
    status: number = 401,
    code: "UNAUTHORIZED" | "FORBIDDEN" = "UNAUTHORIZED"
  ) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export type AuthContext = {
  token: AccessTokenPayload;
  userId: number;
  role: UserRole;
};

function parseCookieValue(cookieHeader: string, cookieName: string): string | null {
  const encoded = cookieHeader
    .split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith(`${cookieName}=`))
    ?.split("=")[1];
  return encoded ? decodeURIComponent(encoded) : null;
}

export function getAccessTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (bearerToken) return bearerToken;

  const cookieHeader = request.headers.get("cookie") || "";
  return parseCookieValue(cookieHeader, ACCESS_TOKEN_COOKIE);
}

export function requireAuth(request: Request): AuthContext {
  const token = getAccessTokenFromRequest(request);
  if (!token) {
    throw new AuthError("Unauthorized: access token missing");
  }

  let decoded: AccessTokenPayload;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    throw new AuthError("Unauthorized: invalid or expired access token");
  }

  const userId = Number(decoded.sub || decoded.id);
  if (!Number.isFinite(userId) || userId <= 0) {
    throw new AuthError("Unauthorized: invalid token payload");
  }

  return {
    token: decoded,
    userId,
    role: normalizeRole(decoded.role),
  };
}

export function requireRole(request: Request, allowedRoles: UserRole[]): AuthContext {
  const auth = requireAuth(request);
  if (!allowedRoles.includes(auth.role)) {
    throw new AuthError("Forbidden: insufficient role permissions", 403, "FORBIDDEN");
  }
  return auth;
}

export function authErrorResponse(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { success: false, message: error.message, code: error.code },
      { status: error.status }
    );
  }
  return null;
}
