import { z } from "zod";

export const adminForgotPasswordSchema = z.object({
  email: z.email({ message: "Enter your work email address" }),
});

export type AdminForgotPasswordValues = z.infer<typeof adminForgotPasswordSchema>;

/**
 * Password *set* rules — complexity belongs here, not on login (see login-schema).
 */
export const adminResetPasswordSchema = z
  .object({
    token: z.string().trim().min(16, { message: "This reset link is invalid." }),
    password: z
      .string()
      .min(10, { message: "Use at least 10 characters" })
      .max(128, { message: "That password is too long" }),
    confirmPassword: z.string().min(1, { message: "Confirm your new password" }),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type AdminResetPasswordValues = z.infer<typeof adminResetPasswordSchema>;

/** Logged-in password change (Settings) — requires current password. */
export const adminChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Enter your current password" }),
    password: z
      .string()
      .min(10, { message: "Use at least 10 characters" })
      .max(128, { message: "That password is too long" }),
    confirmPassword: z.string().min(1, { message: "Confirm your new password" }),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((value) => value.password !== value.currentPassword, {
    message: "New password must be different from the current one",
    path: ["password"],
  });

export type AdminChangePasswordValues = z.infer<typeof adminChangePasswordSchema>;
