import reviewMd from "../../content/tasks/review/REVIEW.md?raw"
import { DownloadList } from "../components/DownloadList.tsx"
import { Markdown } from "../components/Markdown.tsx"
import { ProvenanceNote } from "../components/ProvenanceNote.tsx"
import { useTitle } from "../useTitle.ts"

export function ReviewPage() {
  useTitle("Ambiguity review")
  return (
    <article className="page">
      <p className="eyebrow">Task review</p>
      <h1>Reviewing the CEFR gauge task</h1>
      <p className="lede">
        A sample of the review step: flag what a grader could not mark consistently, then say what the shipped
        criteria lock.
      </p>
      <ProvenanceNote />
      <Markdown source={reviewMd} />
      <section>
        <h2>Download</h2>
        <DownloadList
          items={[
            { href: "task-assets/review/REVIEW.md", label: "REVIEW.md", note: "This note, as a file." },
            { href: "downloads/task-design-pack.zip", label: "Full task-design pack", note: "Includes this review with the three tasks." },
          ]}
        />
      </section>
    </article>
  )
}
