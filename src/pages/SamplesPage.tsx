import { Link } from "react-router"
import { DownloadList } from "../components/DownloadList.tsx"
import { ProvenanceNote } from "../components/ProvenanceNote.tsx"
import { publicUrl } from "../publicUrl.ts"
import { useTitle } from "../useTitle.ts"

const SAMPLES = [
  {
    to: "/samples/cefr-gauge",
    kicker: "SVG",
    title: "CEFR gauge",
    text: "Six levels, a keyboard slider, and a text label. The mockup shows B2. The reference starts at A2.",
    image: "task-assets/cefr-gauge/mockup.svg",
    alt: "SVG mockup of a six-band CEFR gauge with B2 selected",
  },
  {
    to: "/samples/flashcards",
    kicker: "Keyboard",
    title: "Flashcards",
    text: "Four synthetic cards. Arrows move. Enter or Space flips. The side is written in text.",
    image: "task-assets/flashcards/mockup.svg",
    alt: "SVG mockup of a flashcard with front text and keyboard hints",
  },
  {
    to: "/samples/error-highlighter",
    kicker: "Canvas",
    title: "Error highlighter",
    text: "A canvas underline plus a text equivalent. The sentences are invented for the demo.",
    image: "task-assets/error-highlighter/mockup.svg",
    alt: "SVG mockup of a sentence with an error underline and a text list beside it",
  },
]

export function SamplesPage() {
  useTitle("Task samples")
  return (
    <article className="page">
      <p className="eyebrow">06 — Visual to code</p>
      <h1>Three tasks a reviewer can grade.</h1>
      <p className="lede">
        The public Frontend / UI Engineer description asks for a visual turned into a coding task, objective
        success criteria, a reference implementation, and a flag when a task is ambiguous. These samples follow
        that shape. They are practice pieces on this site.
      </p>
      <p>
        Role description:{" "}
        <a href="https://jobs.micro1.ai/post/526b27c6-df46-441e-b04d-97dbeb4f5904">
          Frontend / UI Engineer at micro1
        </a>
        .
      </p>
      <ProvenanceNote />
      <div className="sample-index">
        {SAMPLES.map((sample) => (
          <article key={sample.to}>
            <img src={publicUrl(sample.image)} alt={sample.alt} />
            <p className="kicker">{sample.kicker}</p>
            <h2>
              <Link to={sample.to}>{sample.title}</Link>
            </h2>
            <p>{sample.text}</p>
          </article>
        ))}
      </div>
      <section>
        <h2>Review note</h2>
        <p>
          <Link to="/samples/review">A review of the CEFR gauge task</Link> names what was ambiguous and what the
          shipped criteria now lock.
        </p>
      </section>
      <section>
        <h2>Download the pack</h2>
        <DownloadList
          items={[
            {
              href: "downloads/task-design-pack.zip",
              label: "All three tasks and the review",
              note: "Mockups, specs, criteria, verification steps, and the reference component source.",
            },
            {
              href: "downloads/cefr-gauge-task.zip",
              label: "CEFR gauge only",
              note: "One task, zipped.",
            },
            {
              href: "downloads/flashcards-task.zip",
              label: "Flashcards only",
              note: "One task, zipped.",
            },
            {
              href: "downloads/error-highlighter-task.zip",
              label: "Error highlighter only",
              note: "One task, zipped.",
            },
          ]}
        />
      </section>
    </article>
  )
}
