import jwt from "jsonwebtoken";

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;
export const ACCESS_TOKEN_COOKIE = "his_access_token";
export const REFRESH_TOKEN_COOKIE = "his_refresh_token";

export const USER_ROLES = [
  "admin",
  "patient",
  "doctor",
  "helpdesk",
  "pharmacy",
  "billing",
  "laboratory",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type AccessTokenPayload = {
  sub: string;
  id: number | string; // backward compatibility
  email: string;
  role: UserRole;
  patient_id?: string | null;
  doctor_id?: number | null;
  type: "access";
};

export type RefreshTokenPayload = {
  sub: string;
  userId: string;
  tokenId: string;
  type: "refresh";
};

export function normalizeRole(role: string | null | undefined): UserRole {
  const value = String(role || "").toLowerCase();
  switch (value) {
    case "admin":
    case "patient":
    case "doctor":
    case "helpdesk":
    case "pharmacy":
    case "billing":
    case "laboratory":
      return value;
    default:
      return "patient";
  }
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) throw new Error("JWT_SECRET is not set");
  return secret;
}

export function signAccessToken(user: {
  id: number | string;
  email: string;
  role: string;
  patient_id?: string | null;
  doctor_id?: number | null;
}): string {
  return jwt.sign(
    {
      sub: String(user.id),
      id: user.id,
      email: user.email,
      role: normalizeRole(user.role),
      patient_id: user.patient_id ?? null,
      doctor_id: user.doctor_id ?? null,
      type: "access",
    } satisfies AccessTokenPayload,
    getJwtSecret(),
    { expiresIn: ACCESS_TOKEN_TTL_SECONDS }
  );
}

export function signRefreshToken(userId: number | string, tokenId: string): string {
  return jwt.sign(
    { sub: String(userId), userId: String(userId), tokenId, type: "refresh" } satisfies RefreshTokenPayload,
    getJwtSecret(),
    { expiresIn: REFRESH_TOKEN_TTL_SECONDS }
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, getJwtSecret()) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, getJwtSecret()) as RefreshTokenPayload;
}
