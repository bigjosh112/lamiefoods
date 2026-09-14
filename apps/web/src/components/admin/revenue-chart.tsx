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

export interface RevenueChartSeries {
  days: string[];
  series: { name: string; values: number[] }[];
  /** e.g. "₦'000" — the values above are already scaled for a readable axis. */
  unit: string;
}

/** Real data with no orders yet is legitimately all zeros — rendered as flat
 *  lines at the bottom of the chart, not specially handled as an error. */
export function RevenueChart({ days, series, unit }: RevenueChartSeries) {
  const max = Math.max(1, ...series.flatMap((entry) => entry.values));

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const pointsFor = (values: number[]) => {
    if (values.length === 0) return "";
    if (values.length === 1) {
      const y = PADDING.top + plotHeight - (values[0]! / max) * plotHeight;
      const x = PADDING.left + plotWidth / 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }
    return values
      .map((value, index) => {
        const x = PADDING.left + (index / (values.length - 1)) * plotWidth;
        const y = PADDING.top + plotHeight - (value / max) * plotHeight;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  };

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

        {days.map((day, index) => {
          const x =
            days.length === 1
              ? PADDING.left + plotWidth / 2
              : PADDING.left + (index / (days.length - 1)) * plotWidth;
          return (
            <text
              key={`${day}-${index}`}
              x={x}
              y={HEIGHT - 6}
              textAnchor={
                days.length === 1
                  ? "middle"
                  : index === 0
                    ? "start"
                    : index === days.length - 1
                      ? "end"
                      : "middle"
              }
              className="fill-[var(--color-nutmeg)] text-[11px]"
            >
              {day}
            </text>
          );
        })}
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
