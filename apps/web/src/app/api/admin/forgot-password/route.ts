import { NextResponse, type NextRequest } from "next/server";
import {
  isAdminAuthConfigured,
  isDatabaseConfigured,
  isEmailConfigured,
  serverEnv,
} from "@/config/server-env";
import { adminForgotPasswordSchema } from "@/lib/admin/password-reset-schema";
import { timingSafeEqualStrings } from "@/server/admin/auth";
import { createResetToken } from "@/server/admin/password";
import { adminPasswordResetEmail } from "@/server/email/admin-emails";
import { sendMail } from "@/server/email/send";
import { checkRateLimit, clientIp } from "@/server/security/rate-limit";

const GENERIC_OK = {
  ok: true as const,
  message:
    "If that email matches the admin account, a reset link is on its way. Check your inbox.",
};

/**
 * POST /api/admin/forgot-password — always returns the same success body when
 * the stack is configured, whether or not the email matched (no enumeration).
 */
export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  const rateLimit = checkRateLimit(`admin-forgot:${ip}`, {
    windowMs: 15 * 60 * 1000,
    max: 5,
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

  if (!isEmailConfigured()) {
    return NextResponse.json(
      { error: "Password reset email is not connected yet." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const parsed = adminForgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const { ADMIN_EMAIL } = serverEnv();
  const emailMatches =
    ADMIN_EMAIL &&
    timingSafeEqualStrings(
      parsed.data.email.trim().toLowerCase(),
      ADMIN_EMAIL.toLowerCase(),
    );

  if (emailMatches && ADMIN_EMAIL) {
    try {
      const rawToken = await createResetToken();
      if (rawToken) {
        await sendMail(adminPasswordResetEmail(rawToken, ADMIN_EMAIL));
      }
    } catch (error) {
      console.error("[api/admin/forgot-password] Failed:", error);
      // Still return generic success — do not leak mail/DB failures as email existence.
    }
  }

  return NextResponse.json(GENERIC_OK);
}
