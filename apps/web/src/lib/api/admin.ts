import { apiFetch } from "./client";
import type { AdminLoginValues } from "@/lib/admin/login-schema";
import type {
  AdminChangePasswordValues,
  AdminForgotPasswordValues,
  AdminResetPasswordValues,
} from "@/lib/admin/password-reset-schema";

/** POST /api/admin/login — sets the session cookie on success. */
export async function adminLogin(values: AdminLoginValues): Promise<void> {
  await apiFetch<{ ok: true }>("/api/admin/login", { method: "POST", body: values });
}

/** POST /api/admin/logout — clears the session cookie. */
export async function adminLogout(): Promise<void> {
  await apiFetch<{ ok: true }>("/api/admin/logout", { method: "POST" });
}

/** POST /api/admin/forgot-password */
export async function adminForgotPassword(
  values: AdminForgotPasswordValues,
): Promise<{ ok: true; message: string }> {
  return apiFetch<{ ok: true; message: string }>("/api/admin/forgot-password", {
    method: "POST",
    body: values,
  });
}

/** POST /api/admin/reset-password */
export async function adminResetPassword(
  values: AdminResetPasswordValues,
): Promise<void> {
  await apiFetch<{ ok: true }>("/api/admin/reset-password", {
    method: "POST",
    body: values,
  });
}

/** POST /api/admin/change-password — signed-in password update. */
export async function adminChangePassword(
  values: AdminChangePasswordValues,
): Promise<void> {
  await apiFetch<{ ok: true }>("/api/admin/change-password", {
    method: "POST",
    body: values,
  });
}
