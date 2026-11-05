import {
  criteriaFor,
  shortModelName,
  stateLabel,
  type Cell,
  type EvalData,
} from "../data/evalResults.ts"
import { categoryLabel, taskMeta } from "../data/taskMeta.ts"

export function Drilldown({ data, cell }: { data: EvalData; cell: Cell | null }) {
  if (!cell) {
    return (
      <div className="drilldown empty" id="criterion-drilldown">
        <h3>Criterion detail</h3>
        <p>Select a cell in the grid. The criteria for that model and task will appear here, from criteria.csv.</p>
      </div>
    )
  }

  const summary = data.summaries.find((item) => item.model === cell.model)
  const rows = criteriaFor(data, cell.model, cell.taskId)
  const meta = taskMeta(cell.taskId)

  return (
    <div className="drilldown" id="criterion-drilldown" aria-live="polite">
      <p className="kicker">
        {shortModelName(cell.model)} · {cell.taskId} · trial {cell.trial || "—"} of 1
      </p>
      <h3>{meta.title}</h3>
      <p className="meta">{cell.category ? categoryLabel(cell.category) : "Category not on the score row."}</p>
      <dl className="stat-line">
        <div>
          <dt>State</dt>
          <dd>{stateLabel(cell.state)}</dd>
        </div>
        <div>
          <dt>Score field</dt>
          <dd>{cell.score || "—"}</dd>
        </div>
        <div>
          <dt>Deterministic score</dt>
          <dd>{cell.detScore || "—"}</dd>
        </div>
        <div>
          <dt>Passed field</dt>
          <dd>{cell.passed ? "true" : "false"}</dd>
        </div>
        <div>
          <dt>In the headline</dt>
          <dd>{cell.includedInHeadline ? "yes" : "no"}</dd>
        </div>
      </dl>

      {cell.state === "missing" && (
        <div className="callout callout-missing">
          <p>
            This trial is outside the {summary?.passCount}/{summary?.gradedCount} figure. The score row has a
            request error, so <code>grade.py</code> left it out of <code>n_trials</code>. The score field is{" "}
            {cell.score || "empty"}. That value is not a finished model answer.
          </p>
          {cell.error && <pre className="error-text">{cell.error}</pre>}
        </div>
      )}
      {cell.state === "pending" && (
        <div className="callout callout-pending">
          <p>
            The judge did not finish this trial. <code>grade.py</code> includes a row only when{" "}
            <code>judge_complete</code> is true and <code>error</code> is empty. The score field {cell.score || "—"}{" "}
            is an incomplete total. It is not part of the {summary?.passCount}/{summary?.gradedCount} mean.
          </p>
        </div>
      )}
      {cell.includedInHeadline && (
        <p className="meta">
          Fully graded trial. A pass in <code>scores.csv</code> already required a score of at least 0.8 and every
          critical criterion. This page reads the <code>passed</code> field. It does not re-decide it.
          {cell.flags.includes("FORMAT_FAIL")
            ? " The format-fail flag is on a row that was still fully graded, so it stays in the denominator."
            : ""}
        </p>
      )}
      {cell.flags.length > 0 && (
        <p className="meta">
          Flags: {cell.flags.join(", ")}.
        </p>
      )}
      <p className="meta">
        Raw trial JSON is not in this public copy. The path recorded on the row is{" "}
        <code>{cell.file || "blank"}</code>.
      </p>

      {rows.length === 0 ? (
        <p>No criterion rows in criteria.csv for this model and task.</p>
      ) : (
        <div className="grid-scroll" tabIndex={0} aria-label="Criterion rows">
          <table className="criteria-table">
            <caption>
              {rows.length} criteria for {cell.taskId}
            </caption>
            <thead>
              <tr>
                <th scope="col">Criterion</th>
                <th scope="col">Type</th>
                <th scope="col">Weight</th>
                <th scope="col">Critical</th>
                <th scope="col">Verdict</th>
                <th scope="col">Credit</th>
                <th scope="col">Detail</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.criterion}-${row.trial}`}>
                  <th scope="row">{row.criterion}</th>
                  <td>{row.type}</td>
                  <td>{row.weight}</td>
                  <td>{row.critical ? "yes" : "no"}</td>
                  <td>{row.verdict || "—"}</td>
                  <td>{row.credit || "—"}</td>
                  <td className="detail-cell">{row.detail || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rows.some((row) => row.judgeRaw) && (
        <details>
          <summary>Judge raw text from criteria.csv</summary>
          {rows
            .filter((row) => row.judgeRaw)
            .map((row) => (
              <pre key={row.criterion} className="judge-raw">
                {row.criterion}: {row.judgeRaw}
              </pre>
            ))}
        </details>
      )}
    </div>
  )
}
