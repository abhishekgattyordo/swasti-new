import { z } from 'zod';

// ==================== LOGIN VALIDATION ====================

/**
 * Email or Patient ID validation
 * - Can be email format or alphanumeric patient ID
 */
const emailOrPatientIdSchema = z.string()
  .min(1, "Email or Patient ID is required")
  .max(100, "Email or Patient ID must be less than 100 characters")
  .refine(
    (val) => {
      // Check if it's a valid email
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      // Check if it's a valid patient ID (alphanumeric, can include hyphens)
      const isPatientId = /^[A-Za-z0-9-]+$/.test(val);
      
      return isEmail || isPatientId;
    },
    {
      message: "Please enter a valid email address or patient ID (alphanumeric characters only)"
    }
  );

/**
 * Password validation
 * - Minimum 6 characters
 * - Can add more rules as needed
 */


// ==================== LOGIN SCHEMA ====================

export const LoginSchema = z.object({
  email: emailOrPatientIdSchema,
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must be less than 50 characters")
});

// ==================== REGISTRATION SCHEMA (if needed) ====================

export const RegisterSchema = z.object({
  email: z.string()
    .email("Please enter a valid email address")
    .min(5, "Email must be at least 5 characters")
    .max(100, "Email must be less than 100 characters"),
  
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must be less than 50 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  
  confirmPassword: z.string()
    .min(6, "Confirm password must be at least 6 characters"),
  
  fullNameEn: z.string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters")
    .regex(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces"),
  
role: z.enum(['patient', 'doctor', 'pharmacy', 'helpdesk'], "Please select a valid role"),
  
  patientId: z.string()
    .regex(/^\d+$/, "Patient ID must contain only digits")
    .min(5, "Patient ID must be at least 5 digits")
    .max(20, "Patient ID must be less than 20 digits")
    .optional()
    .nullable()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// ==================== PASSWORD RESET SCHEMA ====================

export const ForgotPasswordSchema = z.object({
  email: z.string()
    .email("Please enter a valid email address")
    .min(5, "Email must be at least 5 characters")
    .max(100, "Email must be less than 100 characters")
});

export const ResetPasswordSchema = z.object({
  token: z.string()
    .min(10, "Invalid reset token")
    .max(200, "Invalid reset token"),
  
  newPassword: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must be less than 50 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  
  confirmNewPassword: z.string()
    .min(6, "Confirm password must be at least 6 characters")
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords do not match",
  path: ["confirmNewPassword"],
});

// ==================== EXPORT TYPES ====================

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

// ==================== VALIDATION FUNCTIONS ====================

export const validateLogin = (data: unknown) => {
  return LoginSchema.safeParse(data);
};

export const validateRegister = (data: unknown) => {
  return RegisterSchema.safeParse(data);
};

export const validateForgotPassword = (data: unknown) => {
  return ForgotPasswordSchema.safeParse(data);
};

export const validateResetPassword = (data: unknown) => {
  return ResetPasswordSchema.safeParse(data);
};