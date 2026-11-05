import { describe, expect, it } from "vitest"
import { resolveBase } from "../basePath.ts"
import {
  cellAriaLabel,
  classifyRow,
  findCell,
  loadEvalResults,
  mean3,
  ratio3,
} from "./evalResults.ts"
import { parseCsv } from "./parseCsv.ts"

describe("parseCsv", () => {
  it("keeps commas and quotes inside a field", () => {
    const rows = parseCsv('model,detail\ndots,"2/4 correct, wrong [\'a\', \'b\']"\n')
    expect(rows).toEqual([{ model: "dots", detail: "2/4 correct, wrong ['a', 'b']" }])
  })

  it("unescapes doubled quotes", () => {
    const rows = parseCsv('a,b\n"say ""hello""",2\n')
    expect(rows[0]).toEqual({ a: 'say "hello"', b: "2" })
  })
})

describe("rounding", () => {
  it("matches the published three-decimal means", () => {
    expect(ratio3(7, 9)).toBe("0.778")
    expect(ratio3(6, 10)).toBe("0.600")
    expect(ratio3(1, 4)).toBe("0.250")
    expect(mean3(["0.6", "1.0", "1.0", "0.7143", "0.6667", "1.0", "0.9286", "1.0", "0.6364", "1.0"])).toBe(
      "0.855",
    )
  })
})

describe("20261101_free", () => {
  const data = loadEvalResults()

  it("parses the real export and agrees with summary_by_model.csv", () => {
    expect(data.checksOk, data.checkMessages.join("\n")).toBe(true)
    expect(data.cells).toHaveLength(30)
    expect(data.criteria).toHaveLength(135)
    expect(data.summaries.map((item) => item.shortName)).toEqual(["Dots 3 Note", "Gemma 4 31B", "Xing 4.0"])
  })

  it("uses graded denominators and does not fold in 429s or pending judge rows", () => {
    const dots = data.summaries[0]
    const gemma = data.summaries[1]
    const xing = data.summaries[2]
    expect(dots.passCount).toBe(6)
    expect(dots.gradedCount).toBe(10)
    expect(dots.meanScore).toBe("0.855")
    expect(dots.partialCount).toBe(0)
    expect(dots.missingCount).toBe(0)

    expect(gemma.passCount).toBe(7)
    expect(gemma.gradedCount).toBe(9)
    expect(gemma.meanScore).toBe("0.909")
    expect(gemma.missingCount).toBe(1)
    expect(gemma.passRate).toBe("0.778")

    expect(xing.passCount).toBe(1)
    expect(xing.gradedCount).toBe(4)
    expect(xing.meanScore).toBe("0.604")
    expect(xing.partialCount).toBe(5)
    expect(xing.missingCount).toBe(1)
    expect(xing.passRate).toBe("0.250")
  })

  it("labels the known holes instead of treating them as ordinary fails", () => {
    const gemmaT07 = findCell(data, "google/gemma-4-31b-it:free", "T07")
    const xingT04 = findCell(data, "xingchen-agi/xing4.0-29b-a4b:free", "T04")
    const xingT09 = findCell(data, "xingchen-agi/xing4.0-29b-a4b:free", "T09")
    const xingT01 = findCell(data, "xingchen-agi/xing4.0-29b-a4b:free", "T01")
    const dotsT01 = findCell(data, "dots-studio/dots-3-note-preview:free", "T01")
    expect(gemmaT07?.state).toBe("missing")
    expect(gemmaT07?.includedInHeadline).toBe(false)
    expect(gemmaT07?.error).toContain("429")
    expect(xingT09?.state).toBe("missing")
    expect(xingT04?.state).toBe("pending")
    expect(xingT04?.includedInHeadline).toBe(false)
    expect(xingT01?.state).toBe("fail")
    expect(xingT01?.includedInHeadline).toBe(true)
    expect(xingT01?.flags).toContain("FORMAT_FAIL")
    expect(dotsT01?.state).toBe("fail")
    expect(cellAriaLabel(gemmaT07!)).toBe("Gemma 4 31B, T07, Missing, HTTP 429")
    expect(cellAriaLabel(xingT04!)).toBe("Xing 4.0, T04, Pending, judge incomplete")
  })

  it("keeps a quoted criterion detail intact", () => {
    const detail = data.criteria.find(
      (row) => row.model.startsWith("dots-studio/") && row.taskId === "T01" && row.criterion === "c3",
    )
    expect(detail?.verdict).toBe("FAIL")
    expect(detail?.detail).toContain("severally")
    expect(detail?.detail).toContain(",")
  })
})

describe("classifyRow", () => {
  it("follows judge_complete and error, which is the grade.py filter", () => {
    expect(classifyRow({ error: "", judgeComplete: true })).toBe("graded")
    expect(classifyRow({ error: "HTTP 429", judgeComplete: true })).toBe("missing")
    expect(classifyRow({ error: "", judgeComplete: false })).toBe("partial")
  })
})

describe("resolveBase", () => {
  it("uses the repository name for a project site and root for a user site", () => {
    expect(resolveBase({})).toBe("/")
    expect(resolveBase({ VITE_BASE: "/frontend-eval-portfolio" })).toBe("/frontend-eval-portfolio/")
    expect(resolveBase({ VITE_BASE: "/" })).toBe("/")
    expect(
      resolveBase({
        GITHUB_REPOSITORY: "oloyeemmanuel6/frontend-eval-portfolio",
        GITHUB_REPOSITORY_OWNER: "someone",
      }),
    ).toBe("/frontend-eval-portfolio/")
    expect(
      resolveBase({
        GITHUB_REPOSITORY: "someone/someone.github.io",
        GITHUB_REPOSITORY_OWNER: "someone",
      }),
    ).toBe("/")
    expect(
      resolveBase({
        VITE_BASE: "/override/",
        GITHUB_REPOSITORY: "oloyeemmanuel6/frontend-eval-portfolio",
        GITHUB_REPOSITORY_OWNER: "someone",
      }),
    ).toBe("/override/")
  })
})
