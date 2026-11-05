import { Link } from "react-router"
import criteriaMd from "../../content/tasks/cefr-gauge/SUCCESS_CRITERIA.md?raw"
import taskMd from "../../content/tasks/cefr-gauge/TASK.md?raw"
import verificationMd from "../../content/tasks/cefr-gauge/VERIFICATION.md?raw"
import { CefrGauge } from "../components/CefrGauge.tsx"
import { DownloadList } from "../components/DownloadList.tsx"
import { Markdown } from "../components/Markdown.tsx"
import { ProvenanceNote } from "../components/ProvenanceNote.tsx"
import { publicUrl } from "../publicUrl.ts"
import { useTitle } from "../useTitle.ts"

export function CefrPage() {
  useTitle("CEFR gauge")
  return (
    <article className="page">
      <p className="eyebrow">Task sample · SVG</p>
      <h1>CEFR gauge</h1>
      <p className="lede">
        Reference implementation. Initial value A2. The mockup below is a picture of the B2 state, not the
        initial state.
      </p>
      <CefrGauge />
      <ProvenanceNote />
      <figure className="mockup-figure">
        <img
          src={publicUrl("task-assets/cefr-gauge/mockup.svg")}
          alt="SVG mockup of the CEFR gauge. Six bands from A1 to C2, needle on B2, caption Selected level B2."
        />
        <figcaption>
          SVG mockup authored as code for this demonstration.{" "}
          <a href={publicUrl("task-assets/cefr-gauge/mockup.svg")} download>
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
            { href: "downloads/cefr-gauge-task.zip", label: "CEFR gauge task zip", note: "Spec, mockup, criteria, verification, reference source." },
            { href: "task-assets/cefr-gauge/TASK.md", label: "TASK.md", note: "Task statement." },
            { href: "task-assets/cefr-gauge/SUCCESS_CRITERIA.md", label: "SUCCESS_CRITERIA.md", note: "What a reviewer marks." },
            { href: "task-assets/cefr-gauge/VERIFICATION.md", label: "VERIFICATION.md", note: "Commands and a manual pass." },
          ]}
        />
        <p>
          <Link to="/samples/review">Read the ambiguity review of this task</Link>
        </p>
      </section>
    </article>
  )
}
