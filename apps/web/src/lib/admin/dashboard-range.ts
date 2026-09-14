/**
 * Dashboard date-range resolution from URL search params.
 *
 * Presets: today | 7d (default) | 30d | custom&from&to.
 * Custom spans longer than 90 days or with invalid dates fall back to 7d.
 */

export type DashboardRangeId = "today" | "7d" | "30d" | "custom";

export interface DashboardDateWindow {
  range: DashboardRangeId;
  from: string;
  to: string;
  /** Shown in chart / tile copy. */
  label: string;
  /** Inclusive list of YYYY-MM-DD days in the window, oldest first. */
  days: string[];
}

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const MAX_CUSTOM_DAYS = 90;

function utcToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseIsoDay(value: string | undefined): Date | null {
  if (!value || !ISO_DAY.test(value)) return null;
  const d = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime()) || toIso(d) !== value) return null;
  return d;
}

function daysBetweenInclusive(from: Date, to: Date): string[] {
  const out: string[] = [];
  const cursor = new Date(from);
  while (cursor.getTime() <= to.getTime()) {
    out.push(toIso(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

function windowEndingToday(dayCount: number, range: DashboardRangeId, label: string): DashboardDateWindow {
  const to = utcToday();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - (dayCount - 1));
  return {
    range,
    from: toIso(from),
    to: toIso(to),
    label,
    days: daysBetweenInclusive(from, to),
  };
}

export function resolveDashboardDateWindow(params: {
  range?: string;
  from?: string;
  to?: string;
}): DashboardDateWindow {
  const rangeRaw = params.range?.trim() || "7d";

  if (rangeRaw === "today") {
    return windowEndingToday(1, "today", "Today");
  }
  if (rangeRaw === "30d") {
    return windowEndingToday(30, "30d", "Last 30 days");
  }
  if (rangeRaw === "custom") {
    const from = parseIsoDay(params.from);
    const to = parseIsoDay(params.to);
    if (from && to && from.getTime() <= to.getTime()) {
      const span =
        Math.floor((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)) + 1;
      if (span <= MAX_CUSTOM_DAYS) {
        return {
          range: "custom",
          from: toIso(from),
          to: toIso(to),
          label: `${toIso(from)} → ${toIso(to)}`,
          days: daysBetweenInclusive(from, to),
        };
      }
    }
  }

  return windowEndingToday(7, "7d", "Last 7 days");
}

/** Axis labels: weekdays for short windows, M/D for longer ones. */
export function chartDayLabel(isoDay: string, dayCount: number): string {
  const date = new Date(`${isoDay}T00:00:00Z`);
  if (dayCount <= 7) {
    return date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
  }
  return date.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    timeZone: "UTC",
  });
}
