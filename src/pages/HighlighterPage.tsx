import criteriaMd from "../../content/tasks/error-highlighter/SUCCESS_CRITERIA.md?raw"
import taskMd from "../../content/tasks/error-highlighter/TASK.md?raw"
import verificationMd from "../../content/tasks/error-highlighter/VERIFICATION.md?raw"
import { DownloadList } from "../components/DownloadList.tsx"
import { ErrorHighlighter } from "../components/ErrorHighlighter.tsx"
import { Markdown } from "../components/Markdown.tsx"
import { ProvenanceNote } from "../components/ProvenanceNote.tsx"
import { publicUrl } from "../publicUrl.ts"
import { useTitle } from "../useTitle.ts"

export function HighlighterPage() {
  useTitle("Error highlighter")
  return (
    <article className="page">
      <p className="eyebrow">Task sample · canvas</p>
      <h1>Learner-error highlighter</h1>
      <p className="lede">
        Reference implementation. The canvas draws the underline. The text equivalent carries the same spans for
        keyboard and screen-reader access. Every sentence is synthetic.
      </p>
      <ErrorHighlighter />
      <ProvenanceNote />
      <figure className="mockup-figure">
        <img
          src={publicUrl("task-assets/error-highlighter/mockup.svg")}
          alt="SVG mockup with a sentence, a wavy underline on was play, and a text-equivalent list."
        />
        <figcaption>
          SVG mockup authored as code for this demonstration.{" "}
          <a href={publicUrl("task-assets/error-highlighter/mockup.svg")} download>
            Download mockup.svg
          </a>
        </figcaption>
      </figure>
      <Markdown source={taskMd} />
      <Markdown source={criteriaMd} />
      <Markdown source={verificationMd} />
      <section>
        <h2>Downloads</h2>
        <DownloadList
          items={[
            { href: "downloads/error-highlighter-task.zip", label: "Error highlighter task zip", note: "Spec, mockup, criteria, verification, reference source." },
            { href: "task-assets/error-highlighter/TASK.md", label: "TASK.md", note: "Task statement." },
            { href: "task-assets/error-highlighter/SUCCESS_CRITERIA.md", label: "SUCCESS_CRITERIA.md", note: "What a reviewer marks." },
            { href: "task-assets/error-highlighter/VERIFICATION.md", label: "VERIFICATION.md", note: "Commands and a manual pass." },
          ]}
        />
      </section>
    </article>
  )
}
