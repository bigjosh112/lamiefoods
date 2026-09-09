import { apiFetch } from "./client";
import type { AdminLoginValues } from "@/lib/admin/login-schema";

/** POST /api/admin/login — sets the session cookie on success. */
export async function adminLogin(values: AdminLoginValues): Promise<void> {
  await apiFetch<{ ok: true }>("/api/admin/login", { method: "POST", body: values });
}

/** POST /api/admin/logout — clears the session cookie. */
export async function adminLogout(): Promise<void> {
  await apiFetch<{ ok: true }>("/api/admin/logout", { method: "POST" });
}
