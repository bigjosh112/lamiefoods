import { NextResponse, type NextRequest } from "next/server";
import { isAdminAuthConfigured, isDatabaseConfigured } from "@/config/server-env";
import { adminResetPasswordSchema } from "@/lib/admin/password-reset-schema";
import { consumeResetToken } from "@/server/admin/password";
import { checkRateLimit, clientIp } from "@/server/security/rate-limit";

/**
 * POST /api/admin/reset-password — consumes a one-time token and sets a new hash.
 */
export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  const rateLimit = checkRateLimit(`admin-reset:${ip}`, {
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

  if (!isAdminAuthConfigured() || !isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Password reset is not connected yet." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const parsed = adminResetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { token, password } = parsed.data;

  try {
    const ok = await consumeResetToken(token, password);
    if (!ok) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired. Request a new one." },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("[api/admin/reset-password] Failed:", error);
    return NextResponse.json(
      { error: "Could not update the password. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
