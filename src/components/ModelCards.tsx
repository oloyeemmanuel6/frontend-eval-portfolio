import type { EvalData, ModelSummary } from "../data/evalResults.ts"

function coverage(summary: ModelSummary): string {
  if (summary.partialCount > 0) {
    return `Partial run. ${summary.gradedCount} of ${summary.taskCount} tasks fully graded. Not comparable to a finished run.`
  }
  if (summary.missingCount > 0) {
    return `${summary.missingCount} task missing. The mean uses the ${summary.gradedCount} graded tasks.`
  }
  return `All ${summary.taskCount} tasks graded.`
}

export function ModelCards({ data }: { data: EvalData }) {
  return (
    <div className="model-cards">
      {data.summaries.map((summary) => (
        <article key={summary.model} className="model-card" data-model={summary.shortName}>
          <p className="kicker">{summary.partialCount > 0 ? "Partial" : "Free tier · 1 trial"}</p>
          <h3>{summary.shortName}</h3>
          <p className="model-id">{summary.model}</p>
          <p className="figure">
            <span className="figure-num">{summary.meanScore}</span>
            <span className="figure-label">mean score</span>
          </p>
          <p className="figure figure-secondary">
            <span className="figure-num">
              {summary.passCount}/{summary.gradedCount}
            </span>
            <span className="figure-label">passed · rate {summary.passRate}</span>
          </p>
          <p>{coverage(summary)}</p>
          {summary.missingCount > 0 && summary.partialCount === 0 && (
            <p className="meta">Missing rows stay out of this fraction.</p>
          )}
          {summary.partialCount > 0 && (
            <p className="meta">
              {summary.partialCount} judge-pending
              {summary.missingCount > 0 ? ` and ${summary.missingCount} request error` : ""}. Those rows are
              outside the {summary.passCount}/{summary.gradedCount}.
            </p>
          )}
          {!summary.matchesOfficial && (
            <p className="meta">
              summary_by_model.csv records mean {summary.officialMean || "—"} and pass rate{" "}
              {summary.officialPassRate || "—"} on {summary.officialTrials || "—"} trials.
            </p>
          )}
        </article>
      ))}
    </div>
  )
}
