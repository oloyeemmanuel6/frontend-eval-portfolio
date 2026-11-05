import type { EvalData } from "../data/evalResults.ts"

const WIDTH = 640
const HEIGHT = 300
const LEFT = 48
const RIGHT = 16
const TOP = 18
const BOTTOM = 72

export function ScoreChart({ data }: { data: EvalData }) {
  const plotW = WIDTH - LEFT - RIGHT
  const plotH = HEIGHT - TOP - BOTTOM
  const groupW = plotW / Math.max(data.summaries.length, 1)
  const desc = data.summaries
    .map(
      (summary) =>
        `${summary.shortName} mean ${summary.meanScore || "n/a"} and pass rate ${summary.passRate || "n/a"} on ${summary.gradedCount} graded tasks`,
    )
    .join(". ")

  return (
    <figure className="chart-figure">
      <figcaption id="score-chart-title">Mean score and pass rate</figcaption>
      <svg
        role="img"
        aria-labelledby="score-chart-title score-chart-desc"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="score-chart"
      >
        <desc id="score-chart-desc">{desc}. Partial runs are hatched and labeled.</desc>
        <defs>
          <pattern id="partial-hatch" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M0 8 L8 0" stroke="#102033" strokeWidth="1.4" />
          </pattern>
        </defs>
        {[0, 0.5, 1].map((tick) => {
          const y = TOP + plotH - tick * plotH
          return (
            <g key={tick}>
              <line x1={LEFT} x2={WIDTH - RIGHT} y1={y} y2={y} className="chart-grid" />
              <text x={LEFT - 8} y={y + 4} className="chart-axis" textAnchor="end">
                {tick.toFixed(1)}
              </text>
            </g>
          )
        })}
        {data.summaries.map((summary, index) => {
          const cx = LEFT + groupW * index + groupW / 2
          const mean = summary.meanScore ? Number(summary.meanScore) : 0
          const rate = summary.passRate ? Number(summary.passRate) : 0
          const barW = 22
          const gap = 8
          const meanH = Math.max(0, Math.min(1, mean)) * plotH
          const rateH = Math.max(0, Math.min(1, rate)) * plotH
          const base = TOP + plotH
          const partial = summary.partialCount > 0
          return (
            <g key={summary.model}>
              <rect
                x={cx - barW - gap / 2}
                y={base - meanH}
                width={barW}
                height={meanH}
                className="bar-mean"
              />
              <rect
                x={cx + gap / 2}
                y={base - rateH}
                width={barW}
                height={rateH}
                className="bar-rate"
              />
              {partial && (
                <rect
                  x={cx - barW - gap / 2}
                  y={TOP}
                  width={barW * 2 + gap}
                  height={plotH}
                  className="bar-hatch"
                />
              )}
              <text x={cx} y={base + 22} className="chart-label" textAnchor="middle">
                {summary.shortName}
              </text>
              <text x={cx} y={base + 40} className="chart-sublabel" textAnchor="middle">
                {summary.passCount}/{summary.gradedCount}
                {partial ? " partial" : ""}
              </text>
            </g>
          )
        })}
      </svg>
      <ul className="chart-legend">
        <li>
          <span className="swatch swatch-mean" /> Mean score, graded tasks only
        </li>
        <li>
          <span className="swatch swatch-rate" /> Pass rate on the same denominator
        </li>
        <li>
          <span className="swatch swatch-hatch" /> Hatch marks a partial run
        </li>
      </ul>
    </figure>
  )
}
