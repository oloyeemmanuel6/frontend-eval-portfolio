# What was ambiguous

This note reviews the CEFR gauge task. It was written with the task, as part of the same AI-assisted demonstration. It is a sample of the review step, not a second person’s independent sign-off.

## Mockup versus contract

The mockup is a picture of one state. A grader who screenshot-diffs the SVG will fail a correct control that uses the required text and a different high-contrast palette. The mockup locks structure: six bands, A1 at the left, C2 at the right, a needle, and a selected-level line. `SUCCESS_CRITERIA.md` is the pass/fail contract. Pixel equality is out of scope.

## Which state is the starting state

The mockup shows B2 selected. The task text originally said “build the gauge in the picture,” which a reviewer could read as “the initial value is B2.” The shipped task separates those. The picture is the B2 state. The reference starts at A2 so a keypress has somewhere to go. A submission that opens on B2 fails criterion 2. A submission that opens on A2 does not fail for disagreeing with the picture.

## Discrete or continuous

“A gauge of the level” can mean a 0–100 score that snaps to a band, or six positions. A needle parked between A2 and B1 cannot be marked right or wrong. The shipped control is six positions. Intermediate values are out of scope and fail the slider’s min, max, and now values.

## Direction

A semicircle with C2 on the left is still a gauge. The criteria lock left-to-right A1 to C2. A reversed control fails, even if it looks finished.

## Motion

An earlier draft did not mention reduced motion. An implementation that revealed the level only after a transition could look done and still hide the result from someone who does not wait. The criteria now require the code in text at rest, and a transition duration of 0s when reduced motion is requested.

## Left soft on purpose

The short gloss under the code is not a required string. Two accurate paraphrases should both pass. If a later task wants those sentences graded, it has to quote them. Colour is also soft: the selection has to be named in text, so a palette change is not a fail.

## What I would send back

I would return a task that said only “match the mockup” with no list of keyboard keys, no initial value, and no statement that the text label is normative. I would accept the task as shipped, because those three points are now in the criteria and covered by `e2e/cefr-gauge.spec.ts`.
