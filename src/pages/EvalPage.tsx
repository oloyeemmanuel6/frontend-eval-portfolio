import { Link } from "react-router"
import { DownloadList } from "../components/DownloadList.tsx"
import { ProvenanceNote } from "../components/ProvenanceNote.tsx"
import { TASK_META } from "../data/taskMeta.ts"
import { useTitle } from "../useTitle.ts"

export function EvalPage() {
  useTitle("ESL Teaching Judgment Eval")
  return (
    <article className="page">
      <p className="eyebrow">04 — Case study</p>
      <h1>ESL Teaching Judgment Eval</h1>
      <p className="lede">
        Ten single-turn tasks about the calls an English teacher makes: a recognised variety versus a learner
        error, a first-language cause, a CEFR rating, a minimal correction, an explanation at the learner’s
        level, and a gap-fill with more than one correct answer.
      </p>
      <ProvenanceNote />

      <section>
        <h2>What was checked, and by whom</h2>
        <p>
          Dami verified every task and expected answer on 1 Nov 2026. An AI assistant drafted the harness and
          the first versions of the tasks, rubrics, reference answers, and README. Each task’s{" "}
          <code>verification_status</code> records Dami’s approval. Learner texts in the eval are synthetic.
        </p>
        <p>
          The eval was submitted to the micro1 Eval Hackathon. A confirmation was received. No score, placement,
          or award is known.
        </p>
        <p>
          Walkthrough:{" "}
          <a href="https://youtu.be/RIdedj__RlQ">https://youtu.be/RIdedj__RlQ</a> on the channel English At Your
          Service.
        </p>
      </section>

      <section>
        <h2>The ten tasks</h2>
          <div className="grid-scroll" tabIndex={0} aria-label="Task list">
          <table className="plain-table">
            <caption>Task list from tasks.jsonl titles</caption>
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Title</th>
              </tr>
            </thead>
            <tbody>
              {TASK_META.map((task) => (
                <tr key={task.id}>
                  <th scope="row">{task.id}</th>
                  <td>{task.title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          The pass threshold on every task is 0.8, and every critical criterion has to be met. Deterministic
          checks cover labels, patterns, CEFR order, exact answer sets, and a word limit. A separate judge model
          scores the criteria code cannot check. The free-run judge was{" "}
          <code>nvidia/nemotron-3-ultra-550b-a55b:free</code>, from a different family than the models under test.
        </p>
      </section>

      <section>
        <h2>The free run</h2>
        <p>
          On 1 Nov 2026, three free OpenRouter models were graded at temperature 0, one trial each, at a cost of
          $0. Gemma 4 31B scored 0.909 with 7 passes out of 9 graded tasks. Dots 3 Note scored 0.855 with 6 out
          of 10. Xing 4.0 scored 0.604 with 1 out of 4 fully graded tasks. Xing is partial. Gemma’s T07 and
          Xing’s T09 are HTTP 429s. Several of Xing’s judge criteria are still pending.
        </p>
        <p>
          The write-up in the archive says both finished models failed the Arabic and Mandarin diagnosis tasks
          for the reason, not the label: they marked the error and explained the wrong cause. Human agreement
          with the judge is pending. Paid frontier models were not run.
        </p>
        <p>
          <Link to="/results">Open the interactive dashboard</Link> for the grid, the chart, and the criterion
          rows.
        </p>
      </section>

      <section>
        <h2>Source archive</h2>
        <p>
          The project keeps the sanitized source in <code>examples/esl-eval</code>. The zip below is that folder.
          A placeholder <code>HTTP-Referer</code> that pointed at a GitHub path Dami does not own was replaced
          before this copy was published here. Raw transcripts, the judge cache, and the human-label sheet are
          not in the archive.
        </p>
        <DownloadList
          items={[
            {
              href: "downloads/esl-eval-20261101.zip",
              label: "Download the eval archive",
              note: "Sanitized source, graded CSVs, README, and the empty .env.example.",
            },
          ]}
        />
      </section>
    </article>
  )
}
