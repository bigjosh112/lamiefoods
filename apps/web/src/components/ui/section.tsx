import { cn } from "@lamiefoods/ui";
import type { ElementType, ReactNode } from "react";

/**
 * Page section shell: the system's fluid page margin plus its 1360px content
 * envelope, so every section lines up on the same rails. Vertical rhythm uses
 * the fluid `--spacing-section` step.
 */
export function Section({
  as: Tag = "section",
  className,
  containerClassName,
  children,
  ...props
}: {
  as?: ElementType;
  className?: string;
  containerClassName?: string;
  children: ReactNode;
} & Omit<React.ComponentPropsWithoutRef<"section">, "className" | "children">) {
  return (
    <Tag className={cn("px-margin py-section", className)} {...props}>
      <div className={cn("mx-auto w-full max-w-(--container-page)", containerClassName)}>
        {children}
      </div>
    </Tag>
  );
}

/**
 * The small tracked-out label that opens most sections. Rendered as a `<p>`
 * rather than a heading so it never competes with the real heading hierarchy —
 * it is decorative kicker text, not a document landmark.
 */
export function Eyebrow({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <p className={cn("font-label text-label-caps text-terracotta uppercase", className)}>
      {children}
    </p>
  );
}
