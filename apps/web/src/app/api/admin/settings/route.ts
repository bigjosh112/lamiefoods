import { NextResponse } from "next/server";
import { settingsSchema, toSettingsInput } from "@/lib/admin/settings-schema";
import { getAdminSession } from "@/server/admin/session";
import { isDatabaseConfigured } from "@/config/server-env";
import { updateSettings } from "@/server/settings/repository";

/**
 * PATCH /api/admin/settings — save the WhatsApp number / bank-transfer
 * details. Re-validates against the exact same `settingsSchema` the form
 * already checked client-side — the browser's check is a convenience, not a
 * control. Session-guarded like every other admin write in this app; no
 * rate limiting, matching the other authenticated admin writes (only
 * unauthenticated writes and login get that).
 */
export async function PATCH(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Settings storage is not connected yet." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid settings.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const settings = await updateSettings(toSettingsInput(parsed.data));
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("[api/admin/settings] Failed to save settings:", error);
    return NextResponse.json({ error: "Could not save settings." }, { status: 500 });
  }
}
