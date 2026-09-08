import { BRAND } from "@lamiefoods/config";

/**
 * Copy for the admin portal.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SECURITY NOTE — what this page deliberately does NOT say.
 *
 * The mock decorated this screen with fabricated security telemetry: a "node
 * terminal" id, an "Active Operational Handshake" status, an "ENFORCED" badge,
 * and a "Cryptographic Integrity — 256-Bit Encrypted Atelier Access · Restricted
 * Network" panel.
 *
 * None of it is real. There is no terminal registry, no handshake, nothing is
 * enforced, and the network is not restricted. Security badges that assert
 * protections which do not exist are worse than no badges: they train an
 * operator to read reassurance off the screen instead of off the system, and
 * they would keep reassuring after a real compromise.
 *
 * What replaces them is a plain "restricted area" statement — and, while
 * ADMIN_EMAIL/ADMIN_PASSWORD_HASH/ADMIN_SESSION_SECRET are unset, an equally
 * plain admission that sign-in isn't connected yet. Both are true statements
 * about the actual state of the system, which is what an operator needs.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const ADMIN_LOGIN = {
  eyebrow: "Staff portal",
  title: `${BRAND.displayName} Admin Portal`,
  body: "Authorised operations, batch routing and dispatch management only.",

  notice: {
    title: "Restricted area",
    body: "Access is limited to authorised staff.",
    /** Shown instead, while ADMIN_EMAIL/ADMIN_PASSWORD_HASH/ADMIN_SESSION_SECRET
     *  are unset — see `isAdminAuthConfigured()`. Sign-in is real now; this is
     *  no longer the default state. */
    bodyNotConfigured:
      "Access is limited to authorised staff. Sign-in is not connected yet, so this form cannot grant access to anything.",
  },

  emailLabel: "Work email address",
  emailPlaceholder: "you@example.com",
  passwordLabel: "Password",
  passwordPlaceholder: "Your password",
  forgotLabel: "Forgot your password?",
  rememberLabel: "Keep me signed in on this device",
  submitLabel: "Sign in to admin portal",

  /** Deliberately identical whether the email or the password was wrong —
   *  distinguishing the two lets someone enumerate valid staff addresses. */
  invalidCredentials: "Incorrect email or password.",
  genericError: "Something went wrong — please try again.",
  notConfiguredError: "Sign-in is not connected yet.",

  footerNote: "Trouble signing in? Speak to whoever administers this site.",
};
