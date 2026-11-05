import { Link, useNavigate } from "react-router"
import { DataBoundary } from "../components/DataBoundary.tsx"
import { ModelCards } from "../components/ModelCards.tsx"
import { PassGrid } from "../components/PassGrid.tsx"
import { ProvenanceNote } from "../components/ProvenanceNote.tsx"
import { loadEvalResults } from "../data/evalResults.ts"
import { useTitle } from "../useTitle.ts"

function Evidence() {
  const data = loadEvalResults()
  const navigate = useNavigate()
  return (
    <>
      <ModelCards data={data} />
      {!data.checksOk && (
        <div role="alert" className="alert">
          <p>The recomputed means do not match summary_by_model.csv. See the results page for both sets of figures.</p>
        </div>
      )}
      <div className="section-head">
        <h2>The pass grid</h2>
        <p>Each cell is one recorded trial. Select one to open its criteria on the results page.</p>
      </div>
      <PassGrid
        data={data}
        onSelect={(model, taskId) => {
          void navigate(`/results?model=${encodeURIComponent(model)}&task=${taskId}`)
        }}
      />
    </>
  )
}

export function HomePage() {
  useTitle("English teaching and task design")
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">01 — Tutor, eval author, task samples</p>
          <h1>Judgment you can check.</h1>
          <p className="lede">
            Dami is an ESL tutor on Preply and runs the YouTube channel English At Your Service. This site
            publishes one real evaluation of teaching judgment, then three frontend samples that turn a picture
            into a coding task with a reference build and tests.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/results">
              Read the graded run
            </Link>
            <Link className="btn btn-line" to="/samples">
              Open the task samples
            </Link>
          </div>
        </div>
        <aside className="hero-note">
          <p className="kicker">Run 20261101_free</p>
          <p>Free models. One trial. Human agreement with the judge is still pending.</p>
          <p>
            <Link to="/eval">The eval case study</Link>
            {" · "}
            <a href="https://youtu.be/RIdedj__RlQ">Five-minute walkthrough</a>
          </p>
        </aside>
      </section>

      <ProvenanceNote compact />

      <section className="band" aria-labelledby="evidence-heading">
        <div className="section-head">
          <p className="eyebrow">02 — Recorded scores</p>
          <h2 id="evidence-heading">The free-tier run, with the holes left in</h2>
          <p>
            Means use only trials the judge finished and that have no request error. That is the same filter as{" "}
            <code>grade.py</code>. Alphabetical by model id, matching <code>summary_by_model.csv</code>.
          </p>
        </div>
        <DataBoundary>
          <Evidence />
        </DataBoundary>
      </section>

      <section className="trio" aria-labelledby="work-heading">
        <h2 id="work-heading">Three pieces of work</h2>
        <article>
          <p className="kicker">Teaching</p>
          <h3>English, in public</h3>
          <p>
            Preply tutor. The public profile, read on 1 Nov 2026, describes 10+ years, Professional Tutor and
            Super Tutor badges, and a 5-star rating from 27 reviews.
          </p>
          <Link to="/about">Facts, as recorded</Link>
        </article>
        <article>
          <p className="kicker">Evaluation</p>
          <h3>Ten teaching judgments</h3>
          <p>
            Variety versus error, first-language transfer, CEFR, minimal correction, and answer keys with more
            than one right answer. Submitted to the micro1 Eval Hackathon. No score is known.
          </p>
          <Link to="/eval">Case study</Link>
        </article>
        <article>
          <p className="kicker">Task design</p>
          <h3>Picture, spec, reference, test</h3>
          <p>
            A CEFR gauge, a keyboard flashcard, and a canvas error highlighter with a text equivalent. Each one
            has an SVG mockup, success criteria, and a Playwright check.
          </p>
          <Link to="/samples">The three samples</Link>
        </article>
      </section>
    </>
  )
}
