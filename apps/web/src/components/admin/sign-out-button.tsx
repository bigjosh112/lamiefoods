"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ADMIN_ROUTES } from "@lamiefoods/config";
import { adminLogout } from "@/lib/api/admin";
import { ICONS } from "@/components/ui/icons";

/** The one control `POST /api/admin/logout` was missing a caller for. */
export function SignOutButton({
  className,
  iconOnly,
}: {
  className?: string;
  /** For a compact slot (the operator card's 36px square) — icon plus a
   *  screen-reader label instead of visible text, which would overflow. */
  iconOnly?: boolean;
}) {
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await adminLogout();
    } finally {
      router.push(ADMIN_ROUTES.login);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleSignOut()}
      disabled={signingOut}
      title={iconOnly ? (signingOut ? "Signing out…" : "Sign out") : undefined}
      className={className}
    >
      <ICONS.signOut className="h-4 w-4" />
      {iconOnly ? (
        <span className="sr-only">{signingOut ? "Signing out…" : "Sign out"}</span>
      ) : (
        <span>{signingOut ? "Signing out…" : "Sign out"}</span>
      )}
    </button>
  );
}
