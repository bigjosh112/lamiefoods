import { z } from "zod";

/**
 * Admin sign-in validation.
 *
 * Deliberately shallow. Client-side rules on a login form exist to catch typos,
 * nothing more — a real credential check happens on the server, and any rule
 * here is trivially bypassed by anyone who wants to.
 *
 * In particular there is **no password complexity rule**. Enforcing shape on
 * sign-in tells an attacker what passwords look like without stopping a single
 * one, and it locks out legitimate accounts whose password predates the rule.
 * Complexity belongs where a password is *set*, and that is the backend's call.
 *
 * The messages are also deliberately non-specific about which field is wrong
 * once credentials are actually checked: distinguishing "no such account" from
 * "wrong password" lets someone enumerate valid staff addresses.
 */
export const adminLoginSchema = z.object({
  email: z.email({ message: "Enter your work email address" }),
  password: z.string().min(1, { message: "Enter your password" }),
  remember: z.boolean(),
});

export type AdminLoginValues = z.infer<typeof adminLoginSchema>;
