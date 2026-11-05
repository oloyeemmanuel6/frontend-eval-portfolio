import { useState, type KeyboardEvent } from "react"
import { FLASHCARDS } from "../data/samples.ts"

export function FlashcardDeck() {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const card = FLASHCARDS[index]
  const side = flipped ? "Back" : "Front"
  const body = flipped ? card.back : card.front

  function go(next: number) {
    const clamped = Math.max(0, Math.min(FLASHCARDS.length - 1, next))
    if (clamped !== index) {
      setIndex(clamped)
      setFlipped(false)
    }
  }

  function onKey(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      go(index + 1)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      go(index - 1)
    } else if (event.key === " " || event.key === "Enter") {
      const target = event.target
      if (target instanceof HTMLElement && target.closest("button")) return
      event.preventDefault()
      setFlipped((value) => !value)
    }
  }

  return (
    <section className="deck" aria-label="Flashcard deck" onKeyDown={onKey}>
      <p className="sample-flag">Synthetic practice cards. Not a student’s deck.</p>
      <div
        className="card-face"
        tabIndex={0}
        role="group"
        aria-label={`Card ${index + 1}, ${side}`}
      >
        <p className="card-kicker">{side}</p>
        <p className="card-body">{body}</p>
        <p className="card-count">
          Card {index + 1} of {FLASHCARDS.length}
        </p>
      </div>
      <div className="deck-controls">
        <button type="button" onClick={() => go(index - 1)} disabled={index === 0}>
          Previous
        </button>
        <button type="button" onClick={() => setFlipped((value) => !value)}>
          Flip
        </button>
        <button type="button" onClick={() => go(index + 1)} disabled={index === FLASHCARDS.length - 1}>
          Next
        </button>
      </div>
      <p className="hint">
        With the card or a button focused: Left and Right change cards. Enter or Space on the card flips it.
      </p>
    </section>
  )
}
