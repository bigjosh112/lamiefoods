import { cn } from "@lamiefoods/ui";
import { SettingsTabs } from "@/components/admin/settings-tabs";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/components/ui/icons";
import { ADMIN_USER } from "@/content/admin-dashboard";
import {
  SETTINGS_ACCESS,
  SETTINGS_BRAND,
  SETTINGS_ENVIRONMENT,
  SETTINGS_FULFILMENT,
  SETTINGS_PAGE,
  SETTINGS_READINESS,
  SETTINGS_STOREFRONT,
  type ReadinessState,
  type SettingRow,
} from "@/content/admin-settings";

/**
 * Settings.
 *
 * The one admin screen whose data is real. Every value is read from what
 * actually serves the site — the shared config package, the product catalogue
 * and the validated environment — because a settings page showing invented
 * values would tell the owner the site is configured in ways it is not.
 *
 * That makes it mostly read-only, which is the honest shape: there is no
 * backend and no CMS, so these change by editing code. Each panel names the
 * file it comes from rather than showing a disabled input with no explanation.
 *
 * Not built, because all of it would be invented: a delivery-fee table (fees
 * are not finalised), a tax rate, a settlement bank account, a roles matrix
 * (there are no accounts to have roles), and notification toggles (nothing can
 * send). Each absence is stated on the page rather than hidden.
 *
 * Chrome comes from `AdminShell`.
 */
export function SettingsView() {
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

      <SettingsTabs
        sections={[
          {
            id: "brand",
            label: "Brand",
            content: (
              <Panel
                title={SETTINGS_BRAND.title}
                body={SETTINGS_BRAND.body}
                file={SETTINGS_BRAND.file}
              >
                <Rows rows={SETTINGS_BRAND.rows} />
              </Panel>
            ),
          },
          {
            id: "storefront",
            label: "Storefront",
            content: (
              <Panel
                title={SETTINGS_STOREFRONT.title}
                body={SETTINGS_STOREFRONT.body}
                file={SETTINGS_STOREFRONT.file}
              >
                <Rows rows={SETTINGS_STOREFRONT.rows} />
              </Panel>
            ),
          },
          {
            id: "fulfilment",
            label: "Delivery & payment",
            content: (
              <Panel
                title={SETTINGS_FULFILMENT.title}
                body={SETTINGS_FULFILMENT.body}
                file={SETTINGS_FULFILMENT.file}
              >
                <Rows rows={SETTINGS_FULFILMENT.rows} />

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
                        <p className="text-body-sm font-semibold text-cacao">
                          {item.label}
                        </p>
                        <p className="mt-0.5 text-body-sm text-nutmeg">{item.note}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Panel>
            ),
          },
          {
            id: "environment",
            label: "Environment",
            content: (
              <Panel
                title={SETTINGS_ENVIRONMENT.title}
                body={SETTINGS_ENVIRONMENT.body}
                file={SETTINGS_ENVIRONMENT.file}
              >
                <ul className="space-y-2">
                  {SETTINGS_ENVIRONMENT.rows.map((row) => (
                    <li
                      key={row.label}
                      className="flex flex-wrap items-start justify-between gap-gutter-sm rounded border border-rule/70 bg-surface-container-low p-gutter-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-label text-label-sm break-all text-cacao">
                          {row.label}
                        </p>
                        <p className="mt-0.5 text-body-sm text-nutmeg">{row.note}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <StateChip state={row.state} />
                        <p className="mt-1 text-body-sm break-all text-on-surface-variant">
                          {row.value}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <p className="mt-gutter-sm flex items-start gap-gutter-sm rounded border border-error/40 bg-error-container p-gutter-sm text-body-sm text-on-error-container">
                  <ICONS.shield className="mt-0.5 h-4 w-4 shrink-0" />
                  {SETTINGS_ENVIRONMENT.warning}
                </p>
              </Panel>
            ),
          },
          {
            id: "access",
            label: "Team & access",
            content: (
              <Panel
                title={SETTINGS_ACCESS.title}
                body={SETTINGS_ACCESS.body}
                file={SETTINGS_ACCESS.file}
              >
                <p className="text-body-sm text-on-surface-variant">
                  {SETTINGS_ACCESS.detail}
                </p>

                {/* The operator card is the one piece of sample data here, and
                    it is labelled as such rather than sitting among real values
                    unmarked. */}
                <div className="mt-gutter-sm flex items-center gap-gutter-sm rounded border border-rule/70 bg-surface-container-low p-gutter-sm">
                  <span
                    aria-hidden="true"
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-linen"
                  >
                    <ICONS.people className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-body-sm font-semibold text-cacao">
                      {ADMIN_USER.name}
                    </p>
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
            ),
          },
        ]}
      />

      <section className="mt-gutter-sm rounded border border-rule/70 bg-surface p-gutter-md">
        <div className="flex flex-wrap items-baseline justify-between gap-gutter-sm">
          <div className="max-w-2xl">
            <h2 className="text-headline-sm text-cacao">{SETTINGS_READINESS.title}</h2>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              {SETTINGS_READINESS.body}
            </p>
          </div>
          <span className="shrink-0 font-label text-label-sm text-nutmeg uppercase">
            {SETTINGS_READINESS.source}
          </span>
        </div>

        <ul className="mt-gutter-sm space-y-2">
          {SETTINGS_READINESS.items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-start gap-gutter-sm rounded border border-rule/70 bg-surface-container-low p-gutter-sm"
            >
              <span className="shrink-0 rounded-sm bg-error-container px-2 py-0.5 font-label text-label-sm text-on-error-container">
                {item.id}
              </span>
              <div className="min-w-56 flex-1">
                <p className="text-body-sm font-semibold text-cacao">{item.label}</p>
                <p className="mt-0.5 text-body-sm text-nutmeg">{item.note}</p>
              </div>
              <span className="shrink-0 font-label text-label-sm text-nutmeg uppercase">
                {item.owner}
              </span>
            </li>
          ))}
        </ul>
      </section>
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

const STATE_STYLES: Record<ReadinessState, string> = {
  ready: "bg-secondary-container text-on-secondary-fixed",
  blocked: "bg-error-container text-on-error-container",
  unknown: "bg-surface-container text-nutmeg",
};

const STATE_LABEL: Record<ReadinessState, string> = {
  ready: "Set",
  blocked: "Missing",
  unknown: "Unknown",
};

function StateChip({ state }: { state: ReadinessState }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 font-label text-label-sm",
        STATE_STYLES[state],
      )}
    >
      {STATE_LABEL[state]}
    </span>
  );
}
