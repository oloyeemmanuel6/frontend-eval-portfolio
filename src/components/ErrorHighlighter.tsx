import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react"
import { HIGHLIGHTER_SAMPLES, type HighlighterSample } from "../data/samples.ts"

const FONT = '18px "Source Sans 3", sans-serif'
const LINE = 30
const PAD = 18

function paintCanvas(canvas: HTMLCanvasElement, cssWidth: number, sample: HighlighterSample) {
  const context = canvas.getContext("2d")
  if (!context) return
  const width = Math.max(280, Math.floor(cssWidth))
  const maxText = width - PAD * 2
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const tokens = [...sample.text.matchAll(/\S+/g)].map((match) => ({
    word: match[0],
    start: match.index ?? 0,
  }))
  const measure = (list: typeof tokens) => {
    if (list.length === 0) return ""
    const start = list[0].start
    const end = list[list.length - 1].start + list[list.length - 1].word.length
    return sample.text.slice(start, end)
  }
  context.font = FONT
  const lines: { text: string; start: number; end: number }[] = []
  let current: typeof tokens = []
  for (const token of tokens) {
    const trial = [...current, token]
    if (current.length > 0 && context.measureText(measure(trial)).width > maxText) {
      const text = measure(current)
      lines.push({ text, start: current[0].start, end: current[0].start + text.length })
      current = [token]
    } else {
      current = trial
    }
  }
  if (current.length > 0) {
    const text = measure(current)
    lines.push({ text, start: current[0].start, end: current[0].start + text.length })
  }
  const height = PAD * 2 + Math.max(lines.length, 1) * LINE
  canvas.width = Math.floor(width * dpr)
  canvas.height = Math.floor(height * dpr)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  context.setTransform(dpr, 0, 0, dpr, 0, 0)
  context.clearRect(0, 0, width, height)
  context.fillStyle = "#f7f1e6"
  context.fillRect(0, 0, width, height)
  context.font = FONT
  context.textBaseline = "alphabetic"
  context.fillStyle = "#14202e"
  lines.forEach((line, lineIndex) => {
    const y = PAD + 22 + lineIndex * LINE
    context.fillText(line.text, PAD, y)
    for (const span of sample.spans) {
      const from = Math.max(span.start, line.start)
      const to = Math.min(span.end, line.end)
      if (to <= from) continue
      const before = line.text.slice(0, from - line.start)
      const chunk = line.text.slice(from - line.start, to - line.start)
      const x = PAD + context.measureText(before).width
      const w = context.measureText(chunk).width
      context.beginPath()
      context.strokeStyle = "#7a2424"
      context.lineWidth = 1.6
      const step = 4
      for (let i = 0; i <= w; i += step) {
        const wave = y + 7 + (Math.floor(i / step) % 2 === 0 ? 0 : 3)
        if (i === 0) context.moveTo(x + i, wave)
        else context.lineTo(x + i, wave)
      }
      context.stroke()
    }
  })
}

function TextEquivalent({ sample }: { sample: HighlighterSample }) {
  const parts: ReactNode[] = []
  let cursor = 0
  sample.spans.forEach((span, index) => {
    if (span.start > cursor) parts.push(sample.text.slice(cursor, span.start))
    parts.push(<mark key={index}>{sample.text.slice(span.start, span.end)}</mark>)
    cursor = span.end
  })
  if (cursor < sample.text.length) parts.push(sample.text.slice(cursor))
  return (
    <section className="equivalent" aria-label="Text equivalent">
      <p className="kicker">Text equivalent</p>
      <p>{parts}</p>
      <ul>
        {sample.spans.map((span) => (
          <li key={`${span.start}-${span.end}`}>
            <strong>{sample.text.slice(span.start, span.end)}</strong>. {span.note}
          </li>
        ))}
      </ul>
    </section>
  )
}

export function ErrorHighlighter() {
  const [index, setIndex] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const sample = HIGHLIGHTER_SAMPLES[index]

  useEffect(() => {
    const canvas = canvasRef.current
    const frame = frameRef.current
    if (!canvas || !frame) return
    const gate = { current: true }
    const draw = () => {
      if (gate.current) paintCanvas(canvas, frame.clientWidth, sample)
    }
    void document.fonts?.ready.then(draw)
    draw()
    const observer = new ResizeObserver(draw)
    observer.observe(frame)
    return () => {
      gate.current = false
      observer.disconnect()
    }
  }, [sample])

  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    const last = HIGHLIGHTER_SAMPLES.length - 1
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault()
      setIndex((value) => Math.min(last, value + 1))
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault()
      setIndex((value) => Math.max(0, value - 1))
    } else if (event.key === "Home") {
      event.preventDefault()
      setIndex(0)
    } else if (event.key === "End") {
      event.preventDefault()
      setIndex(last)
    }
  }

  return (
    <div className="highlighter">
      <p className="sample-flag">Synthetic sentences written for this demo. Not a real student’s writing.</p>
      <div className="highlighter-layout">
        <div>
          <p className="kicker" id="canvas-label">
            Canvas rendering
          </p>
          <div
            role="listbox"
            aria-label="Synthetic sample sentences"
            aria-activedescendant={`sample-${sample.id}`}
            tabIndex={0}
            className="sample-list"
            onKeyDown={onKey}
          >
            {HIGHLIGHTER_SAMPLES.map((item, itemIndex) => (
              <div
                key={item.id}
                id={`sample-${item.id}`}
                role="option"
                aria-selected={itemIndex === index}
                onClick={() => setIndex(itemIndex)}
              >
                {item.title}
              </div>
            ))}
          </div>
          <p className="sr-only" aria-live="polite">
            Showing sample {index + 1} of {HIGHLIGHTER_SAMPLES.length}: {sample.title}
          </p>
          <div className="canvas-frame" ref={frameRef}>
            <canvas ref={canvasRef} aria-hidden="true" />
          </div>
        </div>
        <TextEquivalent sample={sample} />
      </div>
    </div>
  )
}
