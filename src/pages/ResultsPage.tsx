import { useMemo } from "react"
import { useSearchParams } from "react-router"
import { DataBoundary } from "../components/DataBoundary.tsx"
import { Drilldown } from "../components/Drilldown.tsx"
import { ModelCards } from "../components/ModelCards.tsx"
import { PassGrid } from "../components/PassGrid.tsx"
import { RunNotes } from "../components/RunNotes.tsx"
import { ScoreChart } from "../components/ScoreChart.tsx"
import { categoryLabel } from "../data/taskMeta.ts"
import { findCell, loadEvalResults, shortModelName } from "../data/evalResults.ts"
import { useTitle } from "../useTitle.ts"

function ResultsBody() {
  const data = useMemo(() => loadEvalResults(), [])
  const [params, setParams] = useSearchParams()
  const model = params.get("model") ?? ""
  const task = params.get("task") ?? ""
  const cell = findCell(data, model, task) ?? null

  return (
    <>
      {!data.checksOk && (
        <div role="alert" className="alert">
          <h2>Recomputed figures and summary_by_model.csv disagree</h2>
          <ul>
            {data.checkMessages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
          <p>Both stay on the page. No number was smoothed to hide the gap.</p>
        </div>
      )}
      {data.checksOk && (
        <p className="check-ok">
          Recomputed means match <code>summary_by_model.csv</code>. A trial counts only when the judge finished
          and the row has no request error.
        </p>
      )}
      <h2>Models</h2>
      <ModelCards data={data} />
      <ScoreChart data={data} />
      <div className="grid-scroll" tabIndex={0} aria-label="Headline figures">
        <table className="plain-table">
          <caption>Same headline figures as the chart</caption>
          <thead>
            <tr>
              <th scope="col">Model</th>
              <th scope="col">Graded</th>
              <th scope="col">Passed</th>
              <th scope="col">Mean</th>
              <th scope="col">Pass rate</th>
              <th scope="col">Pending</th>
              <th scope="col">Missing</th>
              <th scope="col">Recorded pass@k</th>
            </tr>
          </thead>
          <tbody>
            {data.summaries.map((summary) => (
              <tr key={summary.model}>
                <th scope="row">{summary.shortName}</th>
                <td>{summary.gradedCount}</td>
                <td>
                  {summary.passCount}/{summary.gradedCount}
                </td>
                <td>{summary.meanScore}</td>
                <td>{summary.passRate}</td>
                <td>{summary.partialCount}</td>
                <td>{summary.missingCount}</td>
                <td>{summary.officialPassAtK}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-head">
        <h2>Task by model</h2>
        <p>Pass and Fail are fully graded. Missing is a request error. Pending is an unfinished judge.</p>
      </div>
      <ul className="legend" aria-label="Cell states">
        <li><span className="cell-chip cell-pass">Pass</span> Graded, passed field true</li>
        <li><span className="cell-chip cell-fail">Fail</span> Graded, passed field false</li>
        <li><span className="cell-chip cell-missing">Missing</span> Request error, out of the mean</li>
        <li><span className="cell-chip cell-pending">Pending</span> Judge incomplete, out of the mean</li>
      </ul>
      <PassGrid
        data={data}
        selectedModel={model}
        selectedTask={task}
        onSelect={(nextModel, taskId) => setParams({ model: nextModel, task: taskId })}
      />
      <Drilldown data={data} cell={cell} />

      <div className="section-head">
        <h2>By category, as published</h2>
        <p>
          Rows come from <code>summary_by_category.csv</code>. A category with no fully graded trial is absent.
          It is not shown as zero.
        </p>
      </div>
      <div className="grid-scroll" tabIndex={0} aria-label="Category means">
        <table className="plain-table">
          <caption>Category means from the graded export</caption>
          <thead>
            <tr>
              <th scope="col">Model</th>
              <th scope="col">Category</th>
              <th scope="col">Trials</th>
              <th scope="col">Mean</th>
              <th scope="col">Pass rate</th>
            </tr>
          </thead>
          <tbody>
            {data.categories.map((row) => (
              <tr key={`${row.model}-${row.category}`}>
                <th scope="row">{shortModelName(row.model)}</th>
                <td>{categoryLabel(row.category)}</td>
                <td>{row.nTrials}</td>
                <td>{row.meanScore}</td>
                <td>{row.passRate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <RunNotes />

      <details className="source-dump">
        <summary>Original summary.md from the graded export</summary>
        <pre>{data.summaryMd}</pre>
      </details>
    </>
  )
}

export function ResultsPage() {
  useTitle("Graded results")
  return (
    <article className="page">
      <p className="eyebrow">03 — Dashboard</p>
      <h1>Free-tier results, denominators visible</h1>
      <p className="lede">
        Built from the CSV files in <code>results/graded/20261101_free</code>. Gemma’s mean is 7 passes out of 9
        graded tasks, not out of 10. Xing’s mean is 1 out of 4 fully graded tasks. The other cells are on the
        grid as missing or pending.
      </p>
      <DataBoundary>
        <ResultsBody />
      </DataBoundary>
    </article>
  )
}
