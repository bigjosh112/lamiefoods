"use client";

import { useState } from "react";
import { cn } from "@lamiefoods/ui";

/**
 * Tab strip for the settings panels.
 *
 * Deliberately the smallest possible client component: it owns which panel is
 * showing and nothing else. The panels themselves are server-rendered and
 * passed in as `content`, so the actual settings values — including the
 * environment readout — are never part of a client bundle.
 *
 * The same tab treatment as the orders, products, customers and inventory
 * screens, so the admin reads as one console rather than five.
 */
export function SettingsTabs({
  sections,
}: {
  sections: { id: string; label: string; content: React.ReactNode }[];
}) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  return (
    <>
      <div
        role="tablist"
        aria-label="Settings sections"
        className="mt-gutter-sm flex flex-wrap gap-gutter-xs rounded border border-rule/70 bg-surface p-gutter-sm"
      >
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            role="tab"
            id={`settings-tab-${section.id}`}
            aria-selected={active === section.id}
            aria-controls={`settings-panel-${section.id}`}
            onClick={() => setActive(section.id)}
            className={cn(
              "inline-flex min-h-11 items-center rounded border px-3 font-label text-label-sm transition-colors",
              active === section.id
                ? "border-primary-container bg-primary-container text-linen"
                : "border-rule bg-surface-container-low text-cacao hover:border-cacao",
            )}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Every panel stays mounted so nothing has to re-render on tab change;
          only the inactive ones are hidden. */}
      {sections.map((section) => (
        <div
          key={section.id}
          role="tabpanel"
          id={`settings-panel-${section.id}`}
          aria-labelledby={`settings-tab-${section.id}`}
          hidden={active !== section.id}
          className="mt-gutter-sm"
        >
          {section.content}
        </div>
      ))}
    </>
  );
}
