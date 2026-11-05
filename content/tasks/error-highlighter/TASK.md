# Learner-error highlighter

Draw learner-error spans on a canvas, and repeat the same spans in text.

## Provenance

Self-initiated, AI-assisted demonstration. Not client work. The mockup was authored as SVG for this task. It was not drawn by hand by Dami. The sentences are synthetic samples written for this demo. They are not student writing.

## Artifacts

- `mockup.svg`
- `src/components/ErrorHighlighter.tsx` and the `HIGHLIGHTER_SAMPLES` list in `src/data/samples.ts`
- `SUCCESS_CRITERIA.md`
- `e2e/highlighter.spec.ts`

## Behaviour

Three samples. The first is selected on load. A listbox named “Synthetic sample sentences” moves with Arrow Up, Arrow Down, Home, and End.

Each sample has character spans. The canvas paints the sentence and a wavy underline on each span. The canvas is `aria-hidden`. A region named “Text equivalent” shows the same sentence with each span in a `mark` element, and a list that repeats the span text and its note.

The sentences:

1. “When I was a child I was play football every Friday.” Span: “was play”.
2. “She go to the market and buy rice every morning.” Spans: “She go” and “buy”.
3. “I am living in London since 2019.” Span: “am living”.

A visible line says the sentences are synthetic and not a real student’s writing.

## Out of scope

Real student data. Editing the sentence. Pixel-exact underline coordinates. Handwriting recognition.
