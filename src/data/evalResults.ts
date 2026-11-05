import criteriaCsv from "./csv/criteria.csv?raw"
import scoresCsv from "./csv/scores.csv?raw"
import summaryByCategoryCsv from "./csv/summary_by_category.csv?raw"
import summaryByModelCsv from "./csv/summary_by_model.csv?raw"
import summaryByTaskCsv from "./csv/summary_by_task.csv?raw"
import summaryMd from "./csv/summary.md?raw"
import { parseCsv } from "./parseCsv.ts"
import { TASK_META, taskMeta } from "./taskMeta.ts"

/**
 * Headline numbers follow grade.py `summarize`.
 * A score row is included only when judge_complete is true and error is empty.
 * HTTP 429 rows have an error, so they leave the denominator.
 * JUDGE_PENDING rows have judge_complete false, so they leave the denominator.
 * The recorded score on an excluded row is still shown. It is not a finished mean.
 *
 * grade.py also counts api_errors only on the included rows. Those rows have an
 * empty error by the filter above, so the api_errors column stays 0 even when
 * scores.csv contains HTTP 429s. This module does not treat that 0 as "no rate limits".
 */
export const RUN = {
  id: "20261101_free",
  recordedOn: "2026-11-01",
  judge: "nvidia/nemotron-3-ultra-550b-a55b:free",
  judgeRepeats: 1,
  trialsListedInConfig: 3,
  trialsRecorded: 1,
  temperature: 0,
  costUsd: 0,
  passThreshold: 0.8,
  humanAgreement: "pending" as const,
}

const SHORT_NAMES: Record<string, string> = {
  "dots-studio/dots-3-note-preview:free": "Dots 3 Note",
  "google/gemma-4-31b-it:free": "Gemma 4 31B",
  "xingchen-agi/xing4.0-29b-a4b:free": "Xing 4.0",
}

export function shortModelName(model: string): string {
  return SHORT_NAMES[model] ?? model
}

export type RunStatus = "graded" | "missing" | "partial"
export type CellState = "pass" | "fail" | "missing" | "pending"

export type ScoreRow = {
  model: string
  taskId: string
  trial: string
  file: string
  category: string
  score: string
  passed: boolean
  detScore: string
  judgeComplete: boolean
  flags: string[]
  error: string
  returnedModel: string
  costUsd: string
}

export type CriterionRow = {
  model: string
  taskId: string
  trial: string
  criterion: string
  type: string
  weight: string
  critical: boolean
  verdict: string
  credit: string
  detail: string
  judgeRaw: string
  finalVerdict: string
}

export type Cell = {
  model: string
  taskId: string
  category: string
  runStatus: RunStatus
  state: CellState
  includedInHeadline: boolean
  score: string
  passed: boolean
  detScore: string
  judgeComplete: boolean
  flags: string[]
  error: string
  file: string
  trial: string
}

export type ModelSummary = {
  model: string
  shortName: string
  gradedCount: number
  passCount: number
  partialCount: number
  missingCount: number
  taskCount: number
  meanScore: string
  passRate: string
  officialMean: string
  officialPassRate: string
  officialTrials: string
  officialPending: string
  officialFormatFailures: string
  officialApiErrors: string
  officialPassAtK: string
  officialPassPowK: string
  matchesOfficial: boolean
}

export type CategoryRow = {
  model: string
  category: string
  nTrials: string
  meanScore: string
  passRate: string
}

export type EvalData = {
  summaryMd: string
  models: string[]
  tasks: readonly { id: string; title: string; short: string }[]
  cells: Cell[]
  criteria: CriterionRow[]
  summaries: ModelSummary[]
  categories: CategoryRow[]
  checksOk: boolean
  checkMessages: string[]
}

export function cellKey(model: string, taskId: string): string {
  return `${model}::${taskId}`
}

function flagsOf(value: string): string[] {
  return value
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
}

function isTrue(value: string): boolean {
  return value.trim().toLowerCase() === "true"
}

/** Score strings in this export have at most 4 decimal places. */
export function toUnits(value: string): number {
  const trimmed = value.trim()
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error(`Not a decimal score: ${value}`)
  }
  const negative = trimmed.startsWith("-")
  const raw = negative ? trimmed.slice(1) : trimmed
  const [whole, frac = ""] = raw.split(".")
  if (frac.length > 4) throw new Error(`More than 4 decimal places: ${value}`)
  const units = Number.parseInt(whole, 10) * 10000 + Number.parseInt((frac + "0000").slice(0, 4), 10)
  return negative ? -units : units
}

export function formatMilli(value: number): string {
  const negative = value < 0
  const abs = Math.abs(value)
  const whole = Math.floor(abs / 1000)
  const frac = abs % 1000
  return `${negative ? "-" : ""}${whole}.${frac.toString().padStart(3, "0")}`
}

/** Mean of score strings, half-up to 3 decimal places, returned as "0.909". */
export function mean3(values: readonly string[]): string {
  if (values.length === 0) return ""
  const sum = values.reduce((total, value) => total + toUnits(value), 0)
  const denom = values.length * 10
  const towardZero = Math.trunc(sum / denom)
  const remainder = Math.abs(sum % denom)
  const rounded = remainder * 2 >= denom ? towardZero + Math.sign(sum) : towardZero
  return formatMilli(rounded)
}

/** Integer ratio, half-up to 3 decimal places. */
export function ratio3(numerator: number, denominator: number): string {
  if (denominator <= 0) return ""
  const scaled = numerator * 1000
  const towardZero = Math.trunc(scaled / denominator)
  const remainder = Math.abs(scaled % denominator)
  const rounded = remainder * 2 >= denominator ? towardZero + 1 : towardZero
  return formatMilli(rounded)
}

export function classifyRow(row: Pick<ScoreRow, "error" | "judgeComplete">): RunStatus {
  if (row.error.trim() !== "") return "missing"
  if (!row.judgeComplete) return "partial"
  return "graded"
}

function stateFor(runStatus: RunStatus, passed: boolean): CellState {
  if (runStatus === "missing") return "missing"
  if (runStatus === "partial") return "pending"
  return passed ? "pass" : "fail"
}

function parseScores(text: string): ScoreRow[] {
  return parseCsv(text).map((row) => ({
    model: row.model ?? "",
    taskId: row.task_id ?? "",
    trial: row.trial ?? "",
    file: row.file ?? "",
    category: row.category ?? "",
    score: row.score ?? "",
    passed: isTrue(row.passed ?? ""),
    detScore: row.det_score ?? "",
    judgeComplete: isTrue(row.judge_complete ?? ""),
    flags: flagsOf(row.flags ?? ""),
    error: row.error ?? "",
    returnedModel: row.returned_model ?? "",
    costUsd: row.cost_usd ?? "",
  }))
}

function parseCriteria(text: string): CriterionRow[] {
  return parseCsv(text).map((row) => ({
    model: row.model ?? "",
    taskId: row.task_id ?? "",
    trial: row.trial ?? "",
    criterion: row.criterion ?? "",
    type: row.type ?? "",
    weight: row.weight ?? "",
    critical: isTrue(row.critical ?? ""),
    verdict: row.verdict ?? "",
    credit: row.credit ?? "",
    detail: row.detail ?? "",
    judgeRaw: row.judge_raw ?? "",
    finalVerdict: row.final_verdict ?? "",
  }))
}

function nearly(csvValue: string, recomputed: string): boolean {
  if (csvValue.trim() === "" || recomputed === "") return false
  const left = Number(csvValue)
  const right = Number(recomputed)
  return Number.isFinite(left) && Number.isFinite(right) && Math.abs(left - right) < 0.00051
}

export function loadEvalResults(
  files: {
    scores?: string
    criteria?: string
    summaryByModel?: string
    summaryByTask?: string
    summaryByCategory?: string
    summaryMd?: string
  } = {},
): EvalData {
  const scoreRows = parseScores(files.scores ?? scoresCsv)
  const criteria = parseCriteria(files.criteria ?? criteriaCsv)
  const officialModels = parseCsv(files.summaryByModel ?? summaryByModelCsv)
  const officialTasks = parseCsv(files.summaryByTask ?? summaryByTaskCsv)
  const categories = parseCsv(files.summaryByCategory ?? summaryByCategoryCsv).map((row) => ({
    model: row.model ?? "",
    category: row.category ?? "",
    nTrials: row.n_trials ?? "",
    meanScore: row.mean_score ?? "",
    passRate: row.pass_rate ?? "",
  }))
  const checkMessages: string[] = []

  if (scoreRows.length !== 30) {
    checkMessages.push(`scores.csv has ${scoreRows.length} rows. The 20261101_free export has 30.`)
  }
  if (criteria.length !== 135) {
    checkMessages.push(`criteria.csv has ${criteria.length} rows. The 20261101_free export has 135.`)
  }

  const taskIds = new Set<string>(TASK_META.map((task) => task.id))
  for (const row of scoreRows) taskIds.add(row.taskId)
  const tasks = [...taskIds].map((id) => taskMeta(id))

  const modelOrder = officialModels.map((row) => row.model).filter(Boolean)
  for (const row of scoreRows) {
    if (!modelOrder.includes(row.model)) modelOrder.push(row.model)
  }

  const cells: Cell[] = []
  for (const model of modelOrder) {
    for (const task of tasks) {
      const matches = scoreRows.filter((row) => row.model === model && row.taskId === task.id)
      if (matches.length === 0) {
        cells.push({
          model,
          taskId: task.id,
          category: "",
          runStatus: "missing",
          state: "missing",
          includedInHeadline: false,
          score: "",
          passed: false,
          detScore: "",
          judgeComplete: false,
          flags: [],
          error: "No score row in scores.csv.",
          file: "",
          trial: "",
        })
        continue
      }
      if (matches.length !== 1) {
        checkMessages.push(`${model} ${task.id} has ${matches.length} score rows. This run recorded one trial.`)
      }
      const row = matches[0]
      const runStatus = classifyRow(row)
      cells.push({
        model,
        taskId: task.id,
        category: row.category,
        runStatus,
        state: stateFor(runStatus, row.passed),
        includedInHeadline: runStatus === "graded",
        score: row.score,
        passed: row.passed,
        detScore: row.detScore,
        judgeComplete: row.judgeComplete,
        flags: row.flags,
        error: row.error,
        file: row.file,
        trial: row.trial,
      })
    }
  }

  const summaries: ModelSummary[] = modelOrder.map((model) => {
    const modelCells = cells.filter((cell) => cell.model === model)
    const graded = modelCells.filter((cell) => cell.includedInHeadline)
    const official = officialModels.find((row) => row.model === model)
    const meanScore = mean3(graded.map((cell) => cell.score))
    const passCount = graded.filter((cell) => cell.passed).length
    const passRate = ratio3(passCount, graded.length)
    const summary: ModelSummary = {
      model,
      shortName: shortModelName(model),
      gradedCount: graded.length,
      passCount,
      partialCount: modelCells.filter((cell) => cell.runStatus === "partial").length,
      missingCount: modelCells.filter((cell) => cell.runStatus === "missing").length,
      taskCount: modelCells.length,
      meanScore,
      passRate,
      officialMean: official?.mean_score ?? "",
      officialPassRate: official?.pass_rate ?? "",
      officialTrials: official?.n_trials ?? "",
      officialPending: official?.judge_pending_trials ?? "",
      officialFormatFailures: official?.format_failures ?? "",
      officialApiErrors: official?.api_errors ?? "",
      officialPassAtK: official?.["pass@k"] ?? "",
      officialPassPowK: official?.["pass^k"] ?? "",
      matchesOfficial: false,
    }
    if (!official) {
      checkMessages.push(`No summary_by_model.csv row for ${model}.`)
      return summary
    }
    const sameMean = nearly(official.mean_score, meanScore)
    const sameRate = nearly(official.pass_rate, passRate)
    const sameTrials = official.n_trials === String(graded.length)
    const samePending = official.judge_pending_trials === String(summary.partialCount)
    const sameCovered = official.tasks_covered === String(graded.length)
    summary.matchesOfficial = sameMean && sameRate && sameTrials && samePending && sameCovered
    if (!summary.matchesOfficial) {
      checkMessages.push(
        `${summary.shortName} recomputed ${meanScore} on ${graded.length} graded tasks ` +
          `(pass rate ${passRate}, pending ${summary.partialCount}). ` +
          `summary_by_model.csv says mean ${official.mean_score}, n_trials ${official.n_trials}, ` +
          `pass_rate ${official.pass_rate}, judge_pending_trials ${official.judge_pending_trials}, ` +
          `tasks_covered ${official.tasks_covered}.`,
      )
    }
    return summary
  })

  const taskIndex = new Map(officialTasks.map((row) => [`${row.model}::${row.task_id}`, row]))
  for (const cell of cells) {
    const published = taskIndex.get(cellKey(cell.model, cell.taskId))
    if (cell.includedInHeadline && !published) {
      checkMessages.push(`${cell.model} ${cell.taskId} is graded here but missing from summary_by_task.csv.`)
    }
    if (!cell.includedInHeadline && published) {
      checkMessages.push(`${cell.model} ${cell.taskId} is excluded here but present in summary_by_task.csv.`)
    }
    if (published && cell.includedInHeadline) {
      const publishedPass = published.passes === "1/1"
      if (publishedPass !== cell.passed) {
        checkMessages.push(
          `${cell.model} ${cell.taskId} passes field is ${cell.passed}, summary_by_task.csv says ${published.passes}.`,
        )
      }
    }
  }

  return {
    summaryMd: files.summaryMd ?? summaryMd,
    models: modelOrder,
    tasks,
    cells,
    criteria,
    summaries,
    categories,
    checksOk: checkMessages.length === 0,
    checkMessages,
  }
}

export function criteriaFor(data: EvalData, model: string, taskId: string): CriterionRow[] {
  return data.criteria.filter((row) => row.model === model && row.taskId === taskId)
}

export function findCell(data: EvalData, model: string, taskId: string): Cell | undefined {
  return data.cells.find((cell) => cell.model === model && cell.taskId === taskId)
}

export function stateLabel(state: CellState): string {
  if (state === "pass") return "Pass"
  if (state === "fail") return "Fail"
  if (state === "pending") return "Pending"
  return "Missing"
}

export function cellAriaLabel(cell: Cell): string {
  const name = shortModelName(cell.model)
  const state = stateLabel(cell.state)
  if (cell.state === "missing") {
    const why = cell.error.includes("429") ? "HTTP 429" : "request error"
    return `${name}, ${cell.taskId}, Missing, ${why}`
  }
  if (cell.state === "pending") return `${name}, ${cell.taskId}, Pending, judge incomplete`
  if (cell.flags.includes("FORMAT_FAIL")) return `${name}, ${cell.taskId}, Fail, format fail`
  return `${name}, ${cell.taskId}, ${state}`
}
