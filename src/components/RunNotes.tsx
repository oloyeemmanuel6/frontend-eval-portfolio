import { RUN } from "../data/evalResults.ts"

export function RunNotes() {
  return (
    <section className="notes" aria-labelledby="run-limits">
      <h2 id="run-limits">What this run can support</h2>
      <ul>
        <li>
          Run <code>{RUN.id}</code>, recorded {RUN.recordedOn}. Judge{" "}
          <code>{RUN.judge}</code>, {RUN.judgeRepeats} repeat. Temperature {RUN.temperature}. Cost ${RUN.costUsd}.
        </li>
        <li>
          <code>config.json</code> lists {RUN.trialsListedInConfig} trials. The graded free run recorded{" "}
          {RUN.trialsRecorded} trial per task. With one trial, pass@k and pass^k are the same number as the pass
          rate. That is not a stability estimate.
        </li>
        <li>
          Free-tier limits produced HTTP 429s. Gemma T07 and Xing T09 are request failures. They stay visible and
          stay out of the mean.
        </li>
        <li>
          The judge’s free daily quota ran out before Xing’s remaining judge criteria were scored. Those cells are
          marked Pending. Their score fields are incomplete.
        </li>
        <li>
          <code>summary_by_model.csv</code> shows <code>api_errors</code> as 0. <code>grade.py</code> counts that
          column only on rows that already survived the error filter, so the column cannot see the 429s. The score
          rows are the record of those failures.
        </li>
        <li>
          Human agreement with the judge is {RUN.humanAgreement}. The blind sheet is not in this public copy.
          Judge flip rate was not measured on this run.
        </li>
        <li>
          Paid frontier models were not run. Xing’s 1/4 is a partial run and is not a comparable ranking against
          the two models that finished.
        </li>
      </ul>
    </section>
  )
}
