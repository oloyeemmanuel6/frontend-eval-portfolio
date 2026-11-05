import criteriaMd from "../../content/tasks/flashcards/SUCCESS_CRITERIA.md?raw"
import taskMd from "../../content/tasks/flashcards/TASK.md?raw"
import verificationMd from "../../content/tasks/flashcards/VERIFICATION.md?raw"
import { DownloadList } from "../components/DownloadList.tsx"
import { FlashcardDeck } from "../components/FlashcardDeck.tsx"
import { Markdown } from "../components/Markdown.tsx"
import { ProvenanceNote } from "../components/ProvenanceNote.tsx"
import { publicUrl } from "../publicUrl.ts"
import { useTitle } from "../useTitle.ts"

export function FlashcardPage() {
  useTitle("Flashcards")
  return (
    <article className="page">
      <p className="eyebrow">Task sample · keyboard</p>
      <h1>Flashcards</h1>
      <p className="lede">
        Reference implementation. Four synthetic cards. The side is a word on the card, so the state does not
        depend on a flip animation.
      </p>
      <FlashcardDeck />
      <ProvenanceNote />
      <figure className="mockup-figure">
        <img
          src={publicUrl("task-assets/flashcards/mockup.svg")}
          alt="SVG mockup of a flashcard showing the front, a Flip button, and Left Right keyboard hints."
        />
        <figcaption>
          SVG mockup authored as code for this demonstration.{" "}
          <a href={publicUrl("task-assets/flashcards/mockup.svg")} download>
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
            { href: "downloads/flashcards-task.zip", label: "Flashcard task zip", note: "Spec, mockup, criteria, verification, reference source." },
            { href: "task-assets/flashcards/TASK.md", label: "TASK.md", note: "Task statement." },
            { href: "task-assets/flashcards/SUCCESS_CRITERIA.md", label: "SUCCESS_CRITERIA.md", note: "What a reviewer marks." },
            { href: "task-assets/flashcards/VERIFICATION.md", label: "VERIFICATION.md", note: "Commands and a manual pass." },
          ]}
        />
      </section>
    </article>
  )
}
