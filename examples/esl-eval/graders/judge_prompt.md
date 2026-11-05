You are grading ONE criterion of an answer to an English-language-teaching task. You are not grading the whole answer, only the criterion below. Be strict and literal: judge only what the answer actually says.

## The task the model was given
<task>
{task_prompt}
</task>

## Expert reference notes (written by an experienced ESL teacher; the model did not see these)
<reference>
{reference_notes}
</reference>

## Criterion to grade
{criterion_description}

PASS if: {pass_if}
FAIL if: {fail_if}

## The model's answer
<answer>
{response}
</answer>

## Instructions
- Quote the shortest part of the answer that decides your verdict (or "" if nothing relevant exists).
- If the answer is cut off, unreadable, or you genuinely cannot tell, return UNKNOWN rather than guessing.
- Do not reward length, confidence, or style. Do not penalise extra content unless the FAIL condition says so.

Reply with only this JSON object and nothing else:
{{"verdict": "PASS" | "FAIL" | "UNKNOWN", "evidence": "<short quote>", "reason": "<one sentence>"}}
