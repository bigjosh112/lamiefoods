import "server-only";

import { ADMIN_ROUTES, BRAND } from "@lamiefoods/config";
import { siteUrl } from "@/config/env";
import { escapeHtml, type Mail } from "./send";

/**
 * Admin password-reset email. Plain branded HTML (no order shell dependency)
 * so auth mail stays independent of order templates.
 */

const C = {
  canvas: "#fff8f1",
  card: "#ffffff",
  cacao: "#2b1810",
  terracotta: "#a84c2c",
  rule: "#d8c3b0",
  nutmeg: "#7a5e54",
  linen: "#f4ece1",
  ink: "#1e1b15",
} as const;

export function adminPasswordResetEmail(rawToken: string, to: string): Mail {
  const link = `${siteUrl}${ADMIN_ROUTES.resetPassword}?token=${encodeURIComponent(rawToken)}`;

  const text = `Reset your ${BRAND.displayName} admin password

Open this link within one hour to choose a new password:

${link}

If you did not ask for a reset, you can ignore this email — your current password stays unchanged.

${BRAND.displayName}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:${C.canvas};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.canvas};">
    <tr>
      <td style="padding:28px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;margin:0 auto;background:${C.card};border:1px solid ${C.rule};border-radius:6px;overflow:hidden;font-family:Helvetica,Arial,sans-serif;color:${C.ink};">
          <tr>
            <td style="background:${C.cacao};padding:22px 28px;">
              <p style="margin:0;font-size:18px;font-weight:700;letter-spacing:0.02em;color:${C.linen};">${escapeHtml(BRAND.displayName)}</p>
              <p style="margin:6px 0 0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#fcd8ca;">Admin</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;font-weight:700;color:${C.cacao};">Reset your password</h1>
              <p style="margin:0 0 18px;font-size:15px;line-height:1.55;color:${C.ink};">
                Use the button below within one hour to choose a new admin password.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 0;">
                <tr>
                  <td style="background:${C.terracotta};border-radius:4px;">
                    <a href="${link}" style="display:inline-block;padding:14px 22px;font-size:14px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:${C.linen};text-decoration:none;">
                      Choose a new password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:20px 0 0;font-size:13px;line-height:1.55;color:${C.nutmeg};">
                If you did not ask for a reset, ignore this email — your current password stays unchanged.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return {
    to,
    subject: `Reset your ${BRAND.displayName} admin password`,
    html,
    text,
  };
}
