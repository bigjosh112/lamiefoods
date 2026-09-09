import { NextResponse } from "next/server";
import { adminLoginSchema } from "@/lib/admin/login-schema";
import { isAdminAuthConfigured } from "@/config/server-env";
import { verifyCredentials } from "@/server/admin/auth";
import { setAdminSessionCookie } from "@/server/admin/session";
import { checkRateLimit, clientIp } from "@/server/security/rate-limit";

/**
 * POST /api/admin/login — the only write path `admin-login-form.tsx` calls.
 *
 * Rate-limited more tightly than the order endpoints: this is the one
 * endpoint in the app that exists specifically to be guessed against, so it
 * gets both a lower ceiling and a longer window than order creation's.
 *
 * The error message is identical whether the email is unrecognised or the
 * password is wrong — see `login-schema.ts` and `server/admin/auth.ts` for
 * why (staff-email enumeration).
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  const rateLimit = checkRateLimit(`admin-login:${ip}`, {
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

  if (!isAdminAuthConfigured()) {
    return NextResponse.json({ error: "Sign-in is not connected yet." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid email and password." },
      { status: 400 },
    );
  }

  const { email, password, remember } = parsed.data;

  if (!verifyCredentials(email, password)) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  await setAdminSessionCookie(remember);
  return NextResponse.json({ ok: true });
}
