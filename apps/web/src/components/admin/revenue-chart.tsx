import { cn } from "@lamiefoods/ui";
import { ADMIN_REVENUE_SERIES } from "@/content/admin-dashboard";

/**
 * Revenue trend, drawn as inline SVG.
 *
 * No charting library: three polylines over a fixed grid does not justify
 * shipping one, and the page's whole job is to be readable.
 *
 * A line chart is invisible to a screen reader, so the same numbers are also
 * rendered as a real table, visually hidden. The SVG itself is
 * `aria-hidden` — presenting it twice would be worse than not presenting it.
 */
const WIDTH = 640;
const HEIGHT = 220;
const PADDING = { top: 12, right: 8, bottom: 24, left: 8 };

const SERIES_COLOURS = [
  "var(--color-terracotta)",
  "var(--color-cacao)",
  "var(--color-saffron)",
];

export function RevenueChart() {
  const { days, series, unit } = ADMIN_REVENUE_SERIES;
  const max = Math.max(...series.flatMap((entry) => entry.values));

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const pointsFor = (values: number[]) =>
    values
      .map((value, index) => {
        const x = PADDING.left + (index / (values.length - 1)) * plotWidth;
        const y = PADDING.top + plotHeight - (value / max) * plotHeight;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        aria-hidden="true"
        focusable="false"
      >
        {/* Horizontal guides at quarter intervals. */}
        {[0, 0.25, 0.5, 0.75, 1].map((step) => {
          const y = PADDING.top + plotHeight * step;
          return (
            <line
              key={step}
              x1={PADDING.left}
              x2={WIDTH - PADDING.right}
              y1={y}
              y2={y}
              stroke="var(--color-rule)"
              strokeOpacity={0.4}
              strokeWidth={1}
            />
          );
        })}

        {series.map((entry, index) => (
          <polyline
            key={entry.name}
            points={pointsFor(entry.values)}
            fill="none"
            stroke={SERIES_COLOURS[index % SERIES_COLOURS.length]}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {days.map((day, index) => (
          <text
            key={day}
            x={PADDING.left + (index / (days.length - 1)) * plotWidth}
            y={HEIGHT - 6}
            textAnchor={
              index === 0 ? "start" : index === days.length - 1 ? "end" : "middle"
            }
            className="fill-[var(--color-nutmeg)] text-[11px]"
          >
            {day}
          </text>
        ))}
      </svg>

      <ul className="mt-gutter-sm flex flex-wrap gap-gutter-md">
        {series.map((entry, index) => (
          <li
            key={entry.name}
            className="flex items-center gap-gutter-xs font-label text-label-sm text-on-surface-variant"
          >
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full"
              style={{ background: SERIES_COLOURS[index % SERIES_COLOURS.length] }}
            />
            {entry.name}
          </li>
        ))}
      </ul>

      {/* The chart's data, for screen readers and anyone who wants the numbers. */}
      <table className="sr-only">
        <caption>Daily revenue by flavour, in {unit}</caption>
        <thead>
          <tr>
            <th scope="col">Flavour</th>
            {days.map((day) => (
              <th key={day} scope="col">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {series.map((entry) => (
            <tr key={entry.name}>
              <th scope="row">{entry.name}</th>
              {entry.values.map((value, index) => (
                <td key={`${entry.name}-${days[index]}`}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Small delta label — green-free, since this palette has no success tone. */
export function Delta({ value, className }: { value: string; className?: string }) {
  const negative = value.trim().startsWith("-");
  return (
    <span
      className={cn(
        "rounded-sm px-1.5 py-0.5 font-label text-label-sm",
        negative
          ? "bg-error-container text-on-error-container"
          : "bg-secondary-container text-on-secondary-fixed",
        className,
      )}
    >
      {value}
    </span>
  );
}
