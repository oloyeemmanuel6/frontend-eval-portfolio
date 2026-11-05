# Video script: ESL Teaching Judgment Eval (target 4:30, ≤ 5:00)

> **How to read this script.** It is the walkthrough draft, not a separate results table. Where the speaker says they built the tasks, read it with the README: an assistant drafted the first versions, and Dami verified and approved the tasks and expected answers on 2026-11-01. Spoken figures are rounded (0.91, 0.86). The source of record is `results/graded/20261101_free/summary.md` (0.909 and 0.855). The public video is https://youtu.be/RIdedj__RlQ.

_Not part of the original submission zip. Lines in [brackets] must be filled from the real run before recording. Do not say any number that is not in `results/graded/<run_id>/summary.md`._

## 1. The problem (0:00–1:00) · Screen: title slide, then the T05 learner sentence
"Teachers and learners are already using AI to mark essays, write feedback and build answer keys. Grammar is the easy part. What matters is judgment: knowing whether a sentence is a mistake or a correct feature of Nigerian or American English, knowing why a learner made a mistake, and changing only what is actually wrong.
Here's an example. An Arabic-speaking student writes: 'When I was child, I was play football every Friday.' Most proofreaders fix that to 'I was playing'. An experienced teacher knows that in Arabic, *kāna* plus a present verb means a past habit, so what the student meant was 'I used to play'. The wrong fix teaches the wrong tense."

## 2. What the eval tests (1:00–1:45) · Screen: task table from the README
"I'm an English tutor with more than ten years' experience. I built ten tasks from judgments I make every week. Two separate standard Nigerian or American English from real errors. Four diagnose errors that come from Yoruba, Spanish, Mandarin and Arabic, and each includes a correct phrase that must not be changed. Then there's one CEFR rating task, one where only real errors may be corrected, one where grammar is explained to a beginner in under a hundred words, and one gap-fill where more than one answer is correct. The learner texts are written for this eval, and I checked every expected answer myself."

## 3. How it's graded (1:45–2:45) · Screen: tasks.jsonl entry for T07, then the judge prompt
"Each prompt asks for a JSON block, so most of the grading is plain code: labels, required and banned phrases, CEFR levels, exact answer sets and word limits. For example, T07 passes only if the three real errors are fixed and singular 'they', the split infinitive and the sentence starting with 'And' are left alone.
Where code can't decide, such as whether the L1 explanation is right, a separate judge model grades one rubric item at a time. It gets explicit PASS and FAIL conditions and can answer UNKNOWN. It comes from a different model family than every model tested. Before any model was run, I checked that all ten reference answers pass and all ten deliberately wrong answers fail with the judge. For this zero-cost run the judge was NVIDIA Nemotron 3 Ultra on the free tier, run once per item because of the free quota. A blind sheet for me to hand-label against the judge is in the repo; that agreement check is still pending."

## 4. Results (2:45–4:15) · Screen: summary.md table, then two transcripts
"With no budget for paid models, I tested free models on OpenRouter: Gemma 4 31B and Dots 3 Note Preview, one trial per task at temperature 0. A third, Xing 4.0, only partly finished because of rate limits. Paid frontier models are untested, and the README gives the one command to run them.
Gemma passed 7 of the 9 tasks it completed, 78 percent, with a mean score of 0.91. Dots passed 6 of 10, 60 percent, with a mean of 0.86.
By category, first-language diagnosis was hardest. Both models failed the Arabic and the Mandarin tasks, zero out of two each.
Transcript one: the Arabic task, Gemma. It flagged 'I was play' as an error but said the learner was 'over-applying was to indicate the past' and corrected it to 'played'. In Arabic, kāna plus the imperfect means a past habit, so the fix a teacher gives is 'used to play'.
Transcript two, where a model came close: American English, Gemma. Every label was right, but its advice never told the learner to fix the two real errors."

## 5. Takeaway (4:15–4:45) · Screen: hot-take slide
"These models know the labels for learner errors but not the causes, and the cause is what decides the fix a learner gets. Closing that gap takes more than extra grammar data. Models need to know which variety of English is the standard in a given classroom, and to work from the learner's first language when deciding what to fix. Everything is in the repo, and the eval can be rerun with one command."
