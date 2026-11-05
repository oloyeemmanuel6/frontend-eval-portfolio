import { describe, expect, it } from "vitest"
import { CEFR_LEVELS, FLASHCARDS, HIGHLIGHTER_SAMPLES } from "./samples.ts"

describe("demo fixtures", () => {
  it("locks the CEFR order and the flashcard count", () => {
    expect(CEFR_LEVELS.map((level) => level.code)).toEqual(["A1", "A2", "B1", "B2", "C1", "C2"])
    expect(FLASHCARDS).toHaveLength(4)
  })

  it("points every highlighter span at the phrase inside the sentence", () => {
    expect(HIGHLIGHTER_SAMPLES).toHaveLength(3)
    for (const sample of HIGHLIGHTER_SAMPLES) {
      expect(sample.spans.length).toBeGreaterThan(0)
      for (const span of sample.spans) {
        const phrase = sample.text.slice(span.start, span.end)
        expect(phrase.length).toBeGreaterThan(0)
        expect(sample.text.includes(phrase)).toBe(true)
        expect(span.note.length).toBeGreaterThan(10)
      }
    }
    expect(HIGHLIGHTER_SAMPLES[1].spans).toHaveLength(2)
  })
})
