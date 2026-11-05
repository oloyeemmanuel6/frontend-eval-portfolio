# CEFR gauge

Build a sample CEFR level control from the SVG mockup.

## Provenance

Self-initiated, AI-assisted demonstration. Not client work. The mockup was authored as SVG for this task. It was not drawn by hand by Dami.

## Artifacts

- `mockup.svg` — one state of the control, with B2 selected.
- `src/components/CefrGauge.tsx` — reference implementation.
- `SUCCESS_CRITERIA.md` — the pass/fail contract.
- `e2e/cefr-gauge.spec.ts` — the automated check.

## Behaviour

Render six levels in this order, left to right: A1, A2, B1, B2, C1, C2. The control starts at A2. The mockup’s selected band is B2 so a reviewer can see a second state. Do not treat the mockup’s selected band as the required initial value.

A slider exposes the index. `aria-valuemin` is 0, `aria-valuemax` is 5, `aria-valuenow` is the index, and `aria-valuetext` contains the level code. Arrow Right and Arrow Up move one level toward C2 and stop there. Arrow Left and Arrow Down move toward A1 and stop there. Home selects A1. End selects C2.

Pointing at a level button selects that level. The selected code is written in text outside the graphic. The SVG may be hidden from assistive technology. A visible line says the control is a sample and not a learner record.

## Out of scope

Pixel-matching the mockup. Intermediate scores, plus-levels, and saving a level. A 3D or timed animation. Exact descriptor sentences under the code: they may be paraphrased, and they are not graded.
