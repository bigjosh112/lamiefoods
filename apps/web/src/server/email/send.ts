import "server-only";

import { isEmailConfigured, serverEnv } from "@/config/server-env";

/**
 * Minimal Resend client — one JSON POST.
 *
 * The official SDK pulls three packages for this single request, and every new
 * dependency in this repo has to be audited (house rule 11). `fetch` is already
 * here.
 */
const RESEND_ENDPOINT = "https://api.resend.com/emails";

export interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Sends if configured, and reports whether it did.
 *
 * Never throws. An order that is already committed must not be reported as
 * failed because a mail provider had a bad minute — losing the order would be
 * far worse than a missing email, and the row is the record of account.
 */
export async function sendMail(mail: Mail): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.warn("[email] RESEND_API_KEY/ORDER_EMAIL_FROM unset — skipping send.");
    return false;
  }

  const { RESEND_API_KEY, ORDER_EMAIL_FROM } = serverEnv();

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: ORDER_EMAIL_FROM,
        to: [mail.to],
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      }),
    });

    if (!response.ok) {
      // Prefer Resend's short `message` (e.g. unverified domain) so ops can
      // act; never log the response body wholesale — it can echo `to`.
      let reason = `status ${response.status}`;
      try {
        const payload = (await response.json()) as { message?: unknown };
        if (typeof payload.message === "string" && payload.message.length > 0) {
          reason = `${response.status}: ${payload.message}`;
        }
      } catch {
        // Body wasn't JSON — status alone is still useful.
      }
      console.error(`[email] Resend rejected the send: ${reason}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[email] Send failed:", error instanceof Error ? error.message : error);
    return false;
  }
}

/**
 * Escapes values that came from a customer before they go into HTML.
 *
 * Names, addresses and landmarks are free text typed by a stranger. Without
 * this, a name containing markup would be interpreted as markup in the shop
 * owner's mail client.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
