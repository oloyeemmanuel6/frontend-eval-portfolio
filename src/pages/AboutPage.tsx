import { Link } from "react-router"
import { useTitle } from "../useTitle.ts"

export function AboutPage() {
  useTitle("About")
  return (
    <article className="page">
      <p className="eyebrow">05 — About Dami</p>
      <h1>A tutor who wrote an eval, then a set of interface tasks.</h1>
      <p className="lede">
        The public name on this site is Dami. The frontend samples are new work, made so the task-design side of
        the portfolio can be opened, run, and graded.
      </p>

      <section>
        <h2>Recorded facts</h2>
        <dl className="facts">
          <div>
            <dt>Teaching</dt>
            <dd>
              ESL tutor on Preply. The public profile, read on 1 Nov 2026, describes 10+ years of teaching,
              Professional Tutor and Super Tutor badges, and a 5-star rating from 27 reviews. Specialties listed
              there include Conversational English, Business English, IELTS, TOEFL, English for beginners,
              American English, British English, Intensive English, English for traveling, and job interview
              prep. The profile describes a structured curriculum for beginners, exam preparation, and working
              across Europe, North America, the Middle East, and Africa.
            </dd>
          </div>
          <div>
            <dt>Channel</dt>
            <dd>
              English At Your Service on YouTube. The eval walkthrough is{" "}
              <a href="https://youtu.be/RIdedj__RlQ">https://youtu.be/RIdedj__RlQ</a>.
            </dd>
          </div>
          <div>
            <dt>Evaluation</dt>
            <dd>
              Dami submitted the ESL Teaching Judgment Eval to the micro1 Eval Hackathon and verified the task
              answers on 1 Nov 2026. Confirmation of the submission was received. No score or award is known.
            </dd>
          </div>
          <div>
            <dt>This website</dt>
            <dd>
              A self-initiated, AI-assisted demonstration. Not client work. The reference components, SVG
              mockups, task specs, and tests were produced for this portfolio. Dami can walk through the
              architecture from the README. The site does not stand in for a long public commit history.
            </dd>
          </div>
        </dl>
      </section>

      <section>
        <h2>How to read the samples</h2>
        <p>
          Each sample has an SVG mockup, a task statement, objective success criteria, a working reference on
          this site, verification steps, and a Playwright test. One note reviews the CEFR gauge task for
          ambiguity. That note was written with the task. It is a sample of the review step, not a second
          person’s independent sign-off.
        </p>
        <p>
          <Link to="/samples">Task samples</Link>
          {" · "}
          <Link to="/samples/review">Ambiguity review</Link>
          {" · "}
          <Link to="/results">Graded results</Link>
        </p>
      </section>

      <section>
        <h2>Contact and accounts</h2>
        <p>Messages are not collected on this site. No email address or phone number is published here.</p>
        <p>A GitHub or GitLab profile link is omitted until a repository name is configured for this project.</p>
        <p>There is no Preply profile URL in the source archive, so this page does not invent one.</p>
      </section>
    </article>
  )
}
