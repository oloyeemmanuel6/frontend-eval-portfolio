import { useState, type KeyboardEvent } from "react"
import { CEFR_INITIAL_INDEX, CEFR_LEVELS } from "../data/samples.ts"

const CX = 320
const CY = 248
const OUTER = 180
const INNER = 124

function polar(radius: number, t: number): [number, number] {
  const angle = Math.PI * (1 - t)
  return [CX + radius * Math.cos(angle), CY - radius * Math.sin(angle)]
}

function segmentPath(t0: number, t1: number): string {
  const [ox0, oy0] = polar(OUTER, t0)
  const [ox1, oy1] = polar(OUTER, t1)
  const [ix1, iy1] = polar(INNER, t1)
  const [ix0, iy0] = polar(INNER, t0)
  return `M ${ox0} ${oy0} A ${OUTER} ${OUTER} 0 0 1 ${ox1} ${oy1} L ${ix1} ${iy1} A ${INNER} ${INNER} 0 0 0 ${ix0} ${iy0} Z`
}

export function CefrGauge() {
  const [index, setIndex] = useState(CEFR_INITIAL_INDEX)
  const level = CEFR_LEVELS[index]
  const t = (index + 0.5) / CEFR_LEVELS.length
  const rotation = (t - 0.5) * 180

  function move(next: number) {
    setIndex(Math.max(0, Math.min(CEFR_LEVELS.length - 1, next)))
  }

  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault()
      move(index + 1)
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault()
      move(index - 1)
    } else if (event.key === "Home") {
      event.preventDefault()
      move(0)
    } else if (event.key === "End") {
      event.preventDefault()
      move(CEFR_LEVELS.length - 1)
    }
  }

  return (
    <div className="gauge-widget" onKeyDown={onKey}>
      <div
        role="slider"
        tabIndex={0}
        aria-label="Sample CEFR level"
        aria-valuemin={0}
        aria-valuemax={CEFR_LEVELS.length - 1}
        aria-valuenow={index}
        aria-valuetext={`${level.code}. ${level.name}`}
        className="gauge-slider"
      >
        <svg className="gauge-svg" viewBox="0 0 640 320" aria-hidden="true" data-level={level.code}>
          {CEFR_LEVELS.map((item, itemIndex) => {
            const t0 = itemIndex / CEFR_LEVELS.length
            const t1 = (itemIndex + 1) / CEFR_LEVELS.length
            const [lx, ly] = polar(OUTER + 28, (t0 + t1) / 2)
            return (
              <g key={item.code}>
                <path
                  d={segmentPath(t0, t1)}
                  className={itemIndex === index ? "band band-selected" : "band"}
                />
                <text x={lx} y={ly} className={itemIndex === index ? "band-label is-selected" : "band-label"}>
                  {item.code}
                </text>
              </g>
            )
          })}
          <g
            className="gauge-needle"
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: `${CX}px ${CY}px`,
            }}
          >
            <line x1={CX} y1={CY} x2={CX} y2={CY - 146} />
            <circle cx={CX} cy={CY} r="7" />
          </g>
        </svg>
      </div>
      <div className="level-buttons" role="group" aria-label="Choose a sample level">
        {CEFR_LEVELS.map((item, itemIndex) => (
          <button
            key={item.code}
            type="button"
            aria-pressed={itemIndex === index}
            onClick={() => move(itemIndex)}
          >
            {item.code}
          </button>
        ))}
      </div>
      <p className="selected-level">
        Selected level <strong>{level.code}</strong>. {level.name}. {level.note}
      </p>
      <p className="sample-flag">Sample control. Not a learner record.</p>
    </div>
  )
}
