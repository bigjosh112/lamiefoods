import Link from "next/link";
import { cn } from "@lamiefoods/ui";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

/**
 * The design system's three button treatments.
 *
 * `primary`   Toasted terracotta, hovering to roasted cacao.
 * `secondary` Outlined cacao that fills on hover, inverting its text.
 * `inverted`  For dark cacao sections, where the outlined variant would vanish.
 *
 * All are 4px radius with uppercase Space Grotesk, per the system. Height is
 * floored at 44px so touch targets stay comfortable.
 */
type Variant = "primary" | "secondary" | "inverted";

const base =
  "font-label text-label-caps inline-flex min-h-11 items-center justify-center gap-gutter-xs rounded px-gutter-md text-center uppercase transition-colors duration-200";

const variants: Record<Variant, string> = {
  primary: "bg-primary-container text-linen hover:bg-cacao",
  secondary:
    "border border-cacao text-cacao hover:bg-cacao hover:text-linen bg-transparent",
  inverted: "border border-linen/30 bg-linen/10 text-linen hover:bg-linen/20",
};

interface ButtonLinkProps extends ComponentPropsWithoutRef<typeof Link> {
  variant?: Variant;
  children: ReactNode;
}

export function ButtonLink({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={cn(base, variants[variant], className)} {...props}>
      {children}
    </Link>
  );
}

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: Variant;
  children: ReactNode;
}

interface ButtonAnchorProps extends ComponentPropsWithoutRef<"a"> {
  variant?: Variant;
  children: ReactNode;
}

/** Native anchor treatment for downloads and other non-router resources. */
export function ButtonAnchor({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonAnchorProps) {
  return (
    <a className={cn(base, variants[variant], className)} {...props}>
      {children}
    </a>
  );
}

export function Button({
  variant = "primary",
  className,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(base, variants[variant], "disabled:opacity-50", className)}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * The system's "story link": terracotta text over a persistent underline that
 * warms to saffron on hover. Underline is a border, not text-decoration, so the
 * 4px offset the system specifies is exact.
 */
export function StoryLink({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-11 items-center gap-gutter-xs border-b border-terracotta pb-1 font-label text-label-caps text-terracotta uppercase transition-colors hover:border-saffron hover:text-saffron",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
