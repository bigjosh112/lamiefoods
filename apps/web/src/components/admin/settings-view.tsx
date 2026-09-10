import type { PaymentSettings } from "@lamiefoods/config";
import { PaymentSettingsForm } from "@/components/admin/payment-settings-form";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/components/ui/icons";
import { ADMIN_USER } from "@/content/admin-dashboard";
import {
  SETTINGS_ACCESS,
  SETTINGS_FULFILMENT,
  SETTINGS_PAGE,
  type SettingRow,
} from "@/content/admin-settings";

/**
 * Settings.
 *
 * One page, two stacked sections — delivery & payment, then team & access.
 *
 * It used to be five tabs (brand, storefront, delivery & payment, environment,
 * team & access) plus a "Before launch" list. The owner removed brand,
 * storefront and environment, which left two sections; a tab strip over two
 * sections costs a click to reveal half a short page, so it went with them.
 *
 * What remains is still real. Values come from the shared config package and,
 * for the payment contact, from the `site_settings` table via
 * `server/settings/repository.ts` — a settings page showing invented values
 * would tell the owner the site is configured in ways it is not. Each section
 * names the file it comes from rather than showing a disabled input with no
 * explanation.
 *
 * Two things went with the removed tabs whose information now surfaces nowhere
 * the owner will see it:
 *
 *   - The environment panel reported which variables were set — presence only,
 *     never values. `DATABASE_URL` and the admin credentials being unset is
 *     exactly what makes the storefront render empty and `/admin` return 404,
 *     so that is now diagnosed from `.env.local` rather than from the screen.
 *   - "Before launch" listed the open gaps blocking a public deploy (GAP-004,
 *     unverified prices and claims; GAP-007, the unconfirmed allergen
 *     statement). Both are still open. They now live only in
 *     `docs/ai-memory/gaps.md`.
 *
 * Still not built, because all of it would be invented: a delivery-fee table
 * (fees are not finalised), a tax rate, a settlement account, a roles matrix
 * (there are no accounts to have roles). Each absence is stated on the page
 * rather than hidden.
 *
 * Chrome comes from `AdminShell`.
 */
export function SettingsView({ paymentSettings }: { paymentSettings: PaymentSettings }) {
  return (
    <>
      <div
        role="note"
        className="mb-gutter-md flex items-start gap-gutter-sm rounded border border-rule/70 bg-surface-container p-gutter-sm text-on-surface-variant"
      >
        <ICONS.seal className="mt-0.5 h-5 w-5 shrink-0 text-terracotta" />
        <p className="text-body-sm">
          <strong className="font-semibold text-cacao">
            These values are real — this page invents nothing.
          </strong>{" "}
          Unlike the rest of the admin, every figure below is read from the code and
          environment that serve the live site. Most of it is read-only because there is
          no backend to save to; each panel says which file it comes from.
        </p>
      </div>

      <div className="mb-gutter-md flex flex-wrap items-start justify-between gap-gutter-md">
        <div className="max-w-2xl">
          <p className="font-label text-label-caps text-terracotta uppercase">
            {SETTINGS_PAGE.eyebrow}
          </p>
          <h1 className="mt-1 text-headline-lg text-cacao">{SETTINGS_PAGE.title}</h1>
          <p className="mt-gutter-xs text-body-sm text-on-surface-variant">
            {SETTINGS_PAGE.body}
          </p>
        </div>

        {/* Disabled: there is nothing to save to. */}
        <Button variant="secondary" disabled>
          <ICONS.gear className="h-4 w-4" />
          Save changes
        </Button>
      </div>

      <div className="space-y-4">
        <Panel
          title={SETTINGS_FULFILMENT.title}
          body={SETTINGS_FULFILMENT.body}
          file={SETTINGS_FULFILMENT.file}
        >
          <Rows rows={SETTINGS_FULFILMENT.rows} />

          <h3 className="mt-gutter-md font-label text-label-caps text-nutmeg uppercase">
            Customer contact for payment
          </h3>
          <p className="mt-1 text-body-sm text-nutmeg">
            Shown on the order-success page for the bank-transfer payment method. Editable
            — saves to the database.
          </p>
          <PaymentSettingsForm settings={paymentSettings} />

          <h3 className="mt-gutter-md font-label text-label-caps text-nutmeg uppercase">
            Not configured
          </h3>
          <ul className="mt-gutter-xs space-y-2">
            {SETTINGS_FULFILMENT.missing.map((item) => (
              <li
                key={item.label}
                className="flex items-start gap-gutter-sm rounded border border-rule/70 bg-surface-container-low p-gutter-sm"
              >
                <ICONS.timer className="mt-0.5 h-4 w-4 shrink-0 text-nutmeg" />
                <div className="min-w-0">
                  <p className="text-body-sm font-semibold text-cacao">{item.label}</p>
                  <p className="mt-0.5 text-body-sm text-nutmeg">{item.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title={SETTINGS_ACCESS.title}
          body={SETTINGS_ACCESS.body}
          file={SETTINGS_ACCESS.file}
        >
          <p className="text-body-sm text-on-surface-variant">{SETTINGS_ACCESS.detail}</p>

          {/* The operator card is the one piece of sample data here, and it is
              labelled as such rather than sitting among real values unmarked. */}
          <div className="mt-gutter-sm flex items-center gap-gutter-sm rounded border border-rule/70 bg-surface-container-low p-gutter-sm">
            <span
              aria-hidden="true"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-linen"
            >
              <ICONS.people className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-body-sm font-semibold text-cacao">{ADMIN_USER.name}</p>
              <p className="text-body-sm text-nutmeg">{ADMIN_USER.location}</p>
            </div>
            <span className="shrink-0 font-label text-label-sm text-nutmeg uppercase">
              Sample — not an account
            </span>
          </div>

          <h3 className="mt-gutter-md font-label text-label-caps text-nutmeg uppercase">
            Rules for whoever wires this up
          </h3>
          <ul className="mt-gutter-xs space-y-2">
            {SETTINGS_ACCESS.rules.map((rule) => (
              <li
                key={rule}
                className="flex items-start gap-gutter-sm text-body-sm text-on-surface-variant"
              >
                <ICONS.shield className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
                {rule}
              </li>
            ))}
          </ul>

          <div className="mt-gutter-md flex flex-wrap gap-gutter-xs">
            {/* Disabled: there are no accounts to invite anyone to. */}
            <Button variant="secondary" disabled>
              Invite a teammate
            </Button>
            <Button variant="secondary" disabled>
              Manage roles
            </Button>
          </div>
        </Panel>
      </div>
    </>
  );
}

function Panel({
  title,
  body,
  file,
  children,
}: {
  title: string;
  body: string;
  file: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded border border-rule/70 bg-surface p-gutter-md">
      <div className="mb-gutter-sm flex flex-wrap items-baseline justify-between gap-gutter-sm">
        <div className="max-w-2xl">
          <h2 className="text-headline-sm text-cacao">{title}</h2>
          <p className="mt-1 text-body-sm text-on-surface-variant">{body}</p>
        </div>
        {/* Where the value actually lives, so "why can't I edit this?" has an
            answer on the screen rather than in someone's head. */}
        <code className="shrink-0 rounded-sm bg-surface-container px-2 py-0.5 font-label text-label-sm text-nutmeg">
          {file}
        </code>
      </div>
      {children}
    </section>
  );
}

function Rows({ rows }: { rows: SettingRow[] }) {
  return (
    <dl className="divide-y divide-rule/70 rounded border border-rule/70">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex flex-wrap items-start justify-between gap-gutter-sm p-gutter-sm"
        >
          <dt className="min-w-0">
            <span className="block font-label text-label-sm text-nutmeg uppercase">
              {row.label}
            </span>
            {row.note && (
              <span className="mt-0.5 block text-body-sm break-words text-nutmeg">
                {row.note}
              </span>
            )}
          </dt>
          <dd className="min-w-0 shrink-0 text-right text-body-md break-words text-cacao">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
