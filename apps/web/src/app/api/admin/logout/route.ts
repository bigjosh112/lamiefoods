import { NextResponse } from "next/server";
import { clearAdminSessionCookie } from "@/server/admin/session";

/** POST /api/admin/logout — clears the session cookie. No credential check
 *  needed: clearing a cookie that may not even exist is always safe. */
export async function POST() {
  await clearAdminSessionCookie();
  return NextResponse.json({ ok: true });
}
