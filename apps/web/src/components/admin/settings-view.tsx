import type { PaymentSettings } from "@lamiefoods/config";
import { AdminChangePasswordForm } from "@/components/admin/admin-change-password-form";
import { PaymentSettingsForm } from "@/components/admin/payment-settings-form";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/components/ui/icons";
import {
  SETTINGS_ACCESS,
  SETTINGS_FULFILMENT,
  SETTINGS_PAGE,
  type SettingRow,
} from "@/content/admin-settings";

/**
 * Settings.
 *
 * One page, two stacked sections — delivery & payment, then admin access.
 *
 * It used to be five tabs (brand, storefront, delivery & payment, environment,
 * team & access) plus a "Before launch" list. The owner removed brand,
 * storefront and environment, which left two sections; a tab strip over two
 * sections costs a click to reveal half a short page, so it went with them.
 *
 * Access is a single shared owner login (Q21). Password can be changed here
 * while signed in; forgot-password on the login page covers lockout. There is
 * no invite/roles UI — multi-user accounts are out of scope.
 *
 * What remains is still real. Values come from the shared config package and,
 * for the payment contact, from the `site_settings` table via
 * `server/settings/repository.ts` — a settings page showing invented values
 * would tell the owner the site is configured in ways it is not. Each section
 * names the file it comes from rather than showing a disabled input with no
 * explanation.
 *
 * Chrome comes from `AdminShell`.
 */
export function SettingsView({
  paymentSettings,
  adminEmail,
}: {
  paymentSettings: PaymentSettings;
  adminEmail: string;
}) {
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
            Shown as a customer contact. Bank account details only appear for
            older unpaid bank-transfer orders — new checkout is Paystack-only.
          </p>
          {!paymentSettings.bankTransfer && (
            <p
              role="status"
              className="mt-gutter-sm flex items-start gap-gutter-xs rounded border border-terracotta/40 bg-secondary-container/40 p-gutter-sm text-body-sm text-cacao"
            >
              <ICONS.shield className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
              <span>
                <strong className="font-semibold">Not used at checkout.</strong>{" "}
                New orders pay with Paystack only. Save bank name, account number
                and account name together if you still need them for an older
                unpaid bank-transfer order.
              </span>
            </p>
          )}
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
          <dl className="divide-y divide-rule/70 rounded border border-rule/70">
            <div className="flex flex-wrap items-start justify-between gap-gutter-sm p-gutter-sm">
              <dt className="min-w-0">
                <span className="block font-label text-label-sm text-nutmeg uppercase">
                  {SETTINGS_ACCESS.emailLabel}
                </span>
              </dt>
              <dd className="min-w-0 shrink-0 text-right text-body-md break-all text-cacao">
                {adminEmail}
              </dd>
            </div>
          </dl>

          <h3 className="mt-gutter-md font-label text-label-caps text-nutmeg uppercase">
            {SETTINGS_ACCESS.changePasswordTitle}
          </h3>
          <p className="mt-1 text-body-sm text-nutmeg">{SETTINGS_ACCESS.changePasswordBody}</p>
          <AdminChangePasswordForm />
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
