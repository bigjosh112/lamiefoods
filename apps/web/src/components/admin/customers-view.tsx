import {
  CustomersDirectory,
  type CustomerRow,
} from "@/components/admin/customers-directory";
import { ICONS } from "@/components/ui/icons";
import { formatKobo } from "@/lib/money";

/**
 * Customer directory.
 *
 * As of 2026-09-08 this is real: customers are derived from `orders`/
 * `order_items` (there's no separate `customers` table — guest checkout is a
 * hard product requirement, so email is the only real key). `page.tsx` builds
 * the rows via `server/orders/repository.ts` and passes them down as props —
 * this screen is nothing but customer PII, and a client import would bundle
 * it all into a downloadable chunk (see GAP-009).
 *
 * Every stat below is computed from the rows passed in, so nothing on the
 * page can contradict the directory beneath it. Dropped from the old sample
 * version: an invented loyalty "tier" and a "68% repeat rate vs. a 42%
 * industry benchmark" — neither is a real feature or a real number anyone
 * measured.
 *
 * Chrome comes from `AdminShell`.
 */
export function CustomersView({ customers }: { customers: CustomerRow[] }) {
  const repeatCustomers = customers.filter((c) => c.orderCount >= 2);
  const totalSpend = customers.reduce((sum, c) => sum + c.totalSpendKobo, 0);
  const totalOrders = customers.reduce((sum, c) => sum + c.orderCount, 0);

  const byCity = [...new Set(customers.map((c) => c.city))]
    .map((city) => {
      const inCity = customers.filter((c) => c.city === city);
      return {
        city,
        count: inCity.length,
        share: Math.round((inCity.length / customers.length) * 100),
      };
    })
    .sort((a, b) => b.count - a.count);

  const byFlavour = [
    ...new Set(customers.map((c) => c.favouriteProductName).filter(Boolean)),
  ]
    .map((name) => {
      const count = customers.filter((c) => c.favouriteProductName === name).length;
      return {
        name: name as string,
        count,
        share: Math.round((count / customers.length) * 100),
      };
    })
    .sort((a, b) => b.count - a.count);

  const stats = [
    {
      label: "Customers",
      value: `${customers.length}`,
      note: "Distinct order emails",
      icon: "people" as const,
    },
    {
      label: "Repeat customers",
      value: `${repeatCustomers.length} of ${customers.length}`,
      note:
        customers.length > 0
          ? `${Math.round((repeatCustomers.length / customers.length) * 100)}% have ordered more than once`
          : "No customers yet",
      icon: "award" as const,
    },
    {
      label: "Average lifetime spend",
      value:
        customers.length > 0
          ? formatKobo(Math.round(totalSpend / customers.length))
          : formatKobo(0),
      note:
        customers.length > 0
          ? `${(totalOrders / customers.length).toFixed(1)} orders per customer`
          : "No orders yet",
      icon: "seal" as const,
    },
    {
      label: "Busiest hub",
      value: byCity[0]?.city ?? "—",
      note: byCity[0]
        ? `${byCity[0].count} of ${customers.length} customers`
        : "No orders yet",
      icon: "truck" as const,
    },
  ];

  return (
    <>
      <div className="mb-gutter-md flex flex-wrap items-start justify-between gap-gutter-md">
        <div className="max-w-2xl">
          <p className="font-label text-label-caps text-terracotta uppercase">
            Client ledger
          </p>
          <h1 className="mt-1 text-headline-lg text-cacao">Customer Directory</h1>
          <p className="mt-gutter-xs text-body-sm text-on-surface-variant">
            Every customer who has ordered, with their contact details, delivery landmark
            and order history.
          </p>
        </div>
      </div>

      <ul className="grid gap-gutter-sm sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
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
      <CustomersDirectory customers={customers} />

      {(byCity.length > 0 || byFlavour.length > 0) && (
        <div className="mt-gutter-sm grid gap-gutter-sm lg:grid-cols-2">
          {byCity.length > 0 && (
            <Card title="Where customers are" note="Derived from the directory">
              <ul className="mt-gutter-sm space-y-3">
                {byCity.map((row) => (
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
          )}

          {byFlavour.length > 0 && (
            <Card title="Preferred flavour" note="Most-ordered product per customer">
              <ul className="mt-gutter-sm space-y-3">
                {byFlavour.map((row) => (
                  <li key={row.name}>
                    <div className="flex items-baseline justify-between gap-gutter-sm text-body-sm">
                      <span className="text-cacao">{row.name}</span>
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
          )}
        </div>
      )}
    </>
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
