# Flashcards

Build a four-card deck that can be operated from the keyboard.

## Provenance

Self-initiated, AI-assisted demonstration. Not client work. The mockup was authored as SVG for this task. It was not drawn by hand by Dami. The card sentences are synthetic practice lines, not a student’s deck.

## Artifacts

- `mockup.svg`
- `src/components/FlashcardDeck.tsx` and `src/data/samples.ts`
- `SUCCESS_CRITERIA.md`
- `e2e/flashcards.spec.ts`

## Behaviour

Show card 1 of 4 on the front. The side is the word Front or Back, visible as text. Flip changes the side. Previous and Next change the card and return to the front. Previous is disabled on card 1. Next is disabled on card 4. The deck does not wrap.

Arrow Left and Arrow Right do the same as Previous and Next while focus is inside the deck. Enter or Space on the card flips it. The Flip button also flips it, once.

The cards use these strings:

1. Front: “Standard Nigerian English: next tomorrow”. Back: “It can mean the day after tomorrow. It is a variety feature, not automatically an error.”
2. Front: “A learner writes: I was play football every Friday.” Back: “If the first language is Arabic, this often maps to a past habit. A better correction is used to play, not was playing.”
3. Front: “Two texts: one accurate and simple, one ambitious with slips.” Back: “Do not collapse both to B1. Simple and accurate can be A2. Ambitious writing with slips can be B2.”
4. Front: “American English: I already ate.” Back: “Simple past with already, yet, or just is acceptable in American English. Present perfect with yesterday is a different case.”

A visible line says the cards are synthetic.

## Out of scope

A 3D card rotation. “Flip” means change which face is shown. Persisting progress. Extra cards.
