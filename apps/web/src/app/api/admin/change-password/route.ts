import { NextResponse, type NextRequest } from "next/server";
import { isAdminAuthConfigured, isDatabaseConfigured } from "@/config/server-env";
import { adminChangePasswordSchema } from "@/lib/admin/password-reset-schema";
import { getAdminSession } from "@/server/admin/session";
import {
  getOrBootstrapPasswordHash,
  hashPassword,
  setPasswordHash,
  verifyPassword,
} from "@/server/admin/password";
import { checkRateLimit, clientIp } from "@/server/security/rate-limit";

/**
 * POST /api/admin/change-password — signed-in admin updates their password.
 */
export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  const rateLimit = checkRateLimit(`admin-change-password:${ip}`, {
    windowMs: 15 * 60 * 1000,
    max: 10,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds ?? 300) },
      },
    );
  }

  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  if (!isAdminAuthConfigured() || !isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Password change is not connected yet." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const parsed = adminChangePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { currentPassword, password } = parsed.data;

  try {
    const storedHash = await getOrBootstrapPasswordHash();
    if (!storedHash || !verifyPassword(currentPassword, storedHash)) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 401 },
      );
    }

    await setPasswordHash(hashPassword(password));
  } catch (error) {
    console.error("[api/admin/change-password] Failed:", error);
    return NextResponse.json(
      { error: "Could not update the password. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
