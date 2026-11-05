You are grading an answer to an English-language-teaching task against several separate rubric criteria. Grade each criterion independently: a failure on one must not influence the others. Be strict and literal, and judge only what the answer actually says.

## The task the model was given
<task>
{task_prompt}
</task>

## Expert reference notes (written by an experienced ESL teacher; the model did not see these)
<reference>
{reference_notes}
</reference>

## Criteria to grade
{criteria_block}

## The model's answer
<answer>
{response}
</answer>

## Instructions
- For each criterion, quote the shortest part of the answer that decides your verdict ("" if nothing relevant exists).
- If the answer is cut off, unreadable, or you genuinely cannot tell, return UNKNOWN for that criterion rather than guessing.
- Do not reward length, confidence, or style. Do not penalise extra content unless a FAIL condition says so.

Reply with only this JSON object (one key per criterion id) and nothing else:
{json_skeleton}
