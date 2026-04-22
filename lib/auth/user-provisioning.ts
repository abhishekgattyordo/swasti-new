import bcrypt from "bcryptjs";
import { query, transaction } from "@/lib/db";

export type SupportedUserRole =
  | "admin"
  | "patient"
  | "doctor"
  | "helpdesk"
  | "pharmacy"
  | "billing";

type BaseUserInput = {
  email: string;
  fullNameEn: string;
  role: SupportedUserRole;
  plainPassword?: string;
};

type CreateUserInput = BaseUserInput & {
  patientId?: string | null;
  doctorId?: number | null;
};

const BCRYPT_ROUNDS = 10;

async function hashIfProvided(plainPassword?: string): Promise<string | null> {
  if (!plainPassword?.trim()) return null;
  return bcrypt.hash(plainPassword, BCRYPT_ROUNDS);
}

export async function upsertUserByRole(input: CreateUserInput): Promise<void> {
  const email = input.email.trim().toLowerCase();
  const fullNameEn = input.fullNameEn.trim();
  const role = input.role;
  const patientId = input.patientId ?? null;
  const doctorId = input.doctorId ?? null;
  const passwordHash = await hashIfProvided(input.plainPassword);

  await transaction(async (client) => {
    const existing = await client.query(
      "SELECT id FROM users WHERE email = $1 LIMIT 1",
      [email]
    );

    if (existing.rows.length > 0) {
      const updates: string[] = [
        "full_name_en = $1",
        "role = $2",
        "patient_id = $3",
        "doctor_id = $4",
        "updated_at = NOW()",
      ];
      const values: unknown[] = [fullNameEn, role, patientId, doctorId];
      if (passwordHash) {
        updates.splice(4, 0, "password = $5");
        values.push(passwordHash);
      }
      values.push(email);

      await client.query(
        `UPDATE users SET ${updates.join(", ")} WHERE email = $${values.length}`,
        values
      );
      return;
    }

    if (!passwordHash) {
      throw new Error("plainPassword is required when creating a new user");
    }

    await client.query(
      `
      INSERT INTO users (email, password, full_name_en, role, patient_id, doctor_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      `,
      [email, passwordHash, fullNameEn, role, patientId, doctorId]
    );
  });
}

export async function createPatientUser(input: {
  email: string;
  fullNameEn: string;
  patientId: string;
  plainPassword: string;
}) {
  return upsertUserByRole({
    email: input.email,
    fullNameEn: input.fullNameEn,
    role: "patient",
    patientId: input.patientId,
    doctorId: null,
    plainPassword: input.plainPassword,
  });
}

export async function createDoctorUser(input: {
  email: string;
  fullNameEn: string;
  doctorId: number;
  plainPassword: string;
}) {
  return upsertUserByRole({
    email: input.email,
    fullNameEn: input.fullNameEn,
    role: "doctor",
    patientId: null,
    doctorId: input.doctorId,
    plainPassword: input.plainPassword,
  });
}

export async function createInternalUser(input: {
  email: string;
  fullNameEn: string;
  role: Exclude<SupportedUserRole, "patient" | "doctor">;
  plainPassword: string;
}) {
  return upsertUserByRole({
    email: input.email,
    fullNameEn: input.fullNameEn,
    role: input.role,
    patientId: null,
    doctorId: null,
    plainPassword: input.plainPassword,
  });
}

export async function getUserByEmail(email: string) {
  const result = await query(
    `SELECT id, email, full_name_en, role, patient_id, doctor_id, created_at, updated_at FROM users WHERE email = $1`,
    [email.trim().toLowerCase()]
  );
  return result.rows[0] ?? null;
}
