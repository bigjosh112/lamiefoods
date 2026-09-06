import { CustomersDirectory } from "@/components/admin/customers-directory";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/components/ui/icons";
import {
  CUSTOMERS_FLAVOURS,
  CUSTOMERS_OUTREACH,
  CUSTOMERS_PAGE,
  CUSTOMERS_REGIONS,
  CUSTOMERS_SEGMENTS,
  CUSTOMERS_STATS,
  PATRONS,
} from "@/content/admin-customers";

/**
 * Customer directory.
 *
 * Server-rendered apart from the directory itself, which needs selection state.
 * Patrons are passed down as props rather than imported by the client component
 * — this screen is nothing but PII, and a client import would bundle it all into
 * a downloadable chunk.
 *
 * Every figure on the page is computed from the visible rows, so no card can
 * contradict another. The mock's round numbers (312 patrons, a 68% repeat rate
 * against a 42% "industry benchmark", "100% verified KYC") were not shipped:
 * nothing measures them, there is no KYC process to be 100% of, and they would
 * have disagreed with the six patrons on screen.
 *
 * Chrome comes from `AdminShell`, so the sidebar and top bar cannot drift from
 * the rest of the admin.
 */
export function CustomersView() {
  return (
    <>
      <div
        role="note"
        className="mb-gutter-md flex items-start gap-gutter-sm rounded border border-error/40 bg-error-container p-gutter-sm text-on-error-container"
      >
        <ICONS.shield className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-body-sm">
          <strong className="font-semibold">
            None of these people exist — this is not a customer list.
          </strong>{" "}
          The patrons, phone numbers, emails, addresses and spend figures are invented for
          layout review, and they match the sample names on the orders ledger on purpose.
          Nothing here can be exported, messaged or edited.
        </p>
      </div>

      <div className="mb-gutter-md flex flex-wrap items-start justify-between gap-gutter-md">
        <div className="max-w-2xl">
          <p className="font-label text-label-caps text-terracotta uppercase">
            {CUSTOMERS_PAGE.eyebrow}
          </p>
          <h1 className="mt-1 text-headline-lg text-cacao">{CUSTOMERS_PAGE.title}</h1>
          <p className="mt-gutter-xs text-body-sm text-on-surface-variant">
            {CUSTOMERS_PAGE.body}
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-gutter-xs">
          {/* Both disabled: one would export PII, the other would write a
              customer record. Neither has anywhere to go. */}
          {CUSTOMERS_PAGE.actions.map((action) => {
            const Icon = ICONS[action.icon];
            return (
              <Button key={action.label} variant="secondary" disabled>
                <Icon className="h-4 w-4" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>

      <ul className="grid gap-gutter-sm sm:grid-cols-2 xl:grid-cols-4">
        {CUSTOMERS_STATS.map((stat) => {
          const Icon = ICONS[stat.icon];
          return (
            <li
              key={stat.label}
              className="rounded border border-rule/70 bg-surface p-gutter-md"
            >
              <div className="flex items-start justify-between gap-gutter-sm">
                <div className="min-w-0">
                  <p className="font-label text-label-sm text-nutmeg uppercase">
                    {stat.label}
                  </p>
                  <p className="mt-gutter-xs font-display text-headline-md text-cacao">
                    {stat.value}
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded bg-secondary-container text-primary"
                >
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-gutter-xs text-body-sm text-nutmeg">{stat.note}</p>
            </li>
          );
        })}
      </ul>

      {/* Data passed down, never imported by the client component. */}
      <CustomersDirectory
        patrons={PATRONS}
        segments={[...CUSTOMERS_SEGMENTS]}
        searchPlaceholder={CUSTOMERS_PAGE.searchPlaceholder}
        showing={CUSTOMERS_PAGE.showing}
      />

      <div className="mt-gutter-sm grid gap-gutter-sm lg:grid-cols-3">
        <Card title={CUSTOMERS_REGIONS.title} note={CUSTOMERS_REGIONS.note}>
          <ul className="mt-gutter-sm space-y-3">
            {CUSTOMERS_REGIONS.rows.map((row) => (
              <li key={row.city}>
                <div className="flex items-baseline justify-between gap-gutter-sm text-body-sm">
                  <span className="text-cacao">{row.city}</span>
                  <span className="shrink-0 text-nutmeg">
                    {row.share}% · {row.count}
                  </span>
                </div>
                <div
                  aria-hidden="true"
                  className="mt-1 h-2 overflow-hidden rounded-full bg-surface-container"
                >
                  <div
                    className="h-full rounded-full bg-terracotta"
                    style={{ width: `${row.share}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title={CUSTOMERS_FLAVOURS.title} note={CUSTOMERS_FLAVOURS.note}>
          <FlavourChart slices={CUSTOMERS_FLAVOURS.slices} />
        </Card>

        <Card title={CUSTOMERS_OUTREACH.title} note="Not connected">
          <p className="mt-gutter-sm text-body-sm text-on-surface-variant">
            {CUSTOMERS_OUTREACH.body}
          </p>
          <p className="mt-gutter-xs text-body-sm text-nutmeg">
            {CUSTOMERS_OUTREACH.note}
          </p>
          <Button className="mt-gutter-sm w-full" variant="secondary" disabled>
            <ICONS.mail className="h-4 w-4" />
            {CUSTOMERS_OUTREACH.cta}
          </Button>
        </Card>
      </div>
    </>
  );
}

/** Slice colours, in order. Tokens only — no invented palette. */
const SLICE_COLOURS = [
  "var(--color-terracotta)",
  "var(--color-cacao)",
  "var(--color-nutmeg)",
];

function FlavourChart({
  slices,
}: {
  slices: { slug: string; name: string; count: number; share: number }[];
}) {
  // Cumulative offsets, so the segments meet exactly. Rounded shares need not
  // sum to 100 (three equal slices give 33 each), so the last one runs to the
  // end rather than leaving a sliver of background showing through.
  const stops = slices.map((slice, index) => {
    const from = slices.slice(0, index).reduce((sum, earlier) => sum + earlier.share, 0);
    const to = index === slices.length - 1 ? 100 : from + slice.share;
    const colour = SLICE_COLOURS[index % SLICE_COLOURS.length];
    return `${colour} ${from}% ${to}%`;
  });

  return (
    <div className="mt-gutter-sm flex items-center gap-gutter-sm">
      <div
        aria-hidden="true"
        className="relative h-24 w-24 shrink-0 rounded-full"
        style={{ background: `conic-gradient(${stops.join(", ")})` }}
      >
        <span className="absolute inset-4 rounded-full bg-surface" />
      </div>
      <ul className="min-w-0 flex-1 space-y-1">
        {slices.map((slice, index) => (
          <li key={slice.slug} className="flex items-center gap-gutter-xs text-body-sm">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{
                background: SLICE_COLOURS[index % SLICE_COLOURS.length],
              }}
            />
            <span className="min-w-0 flex-1 truncate text-cacao">{slice.name}</span>
            <span className="shrink-0 text-nutmeg">{slice.share}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Card({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded border border-rule/70 bg-surface p-gutter-md">
      <div className="flex flex-wrap items-baseline justify-between gap-gutter-sm">
        <h2 className="text-headline-sm text-cacao">{title}</h2>
        <span className="font-label text-label-sm text-nutmeg uppercase">{note}</span>
      </div>
      {children}
    </section>
  );
}
