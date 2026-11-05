# ESL Teaching Judgment Eval

> **STATUS (2026-11-01):** Tasks and expected answers verified by Dami (2026-11-01). A zero-cost run on three free OpenRouter models has been run and graded (run `20261101_free`); results below come only from `results/graded/20261101_free/`. Paid frontier models were **not** tested (no budget).

## Public copy

This folder is the sanitized eval archive shipped with Dami's portfolio. It is the 2026-11-01 evidence, not a new run and not a claim of a hackathon score. No score, placement, or award is known.

Not included, because they were not in the sanitized evidence archive: raw model transcripts (`results/raw`), mock-run output, the judge cache, the human-label sheet, and any API key. `.env.example` is an empty key field, not a credential.

`esl_eval/common.py` used to send `HTTP-Referer: https://github.com/esl-eval`. That address is not Dami's GitHub account. It has been replaced with a non-resolving example address. This archive does not link to a GitHub profile.

Dami verified every task and expected answer on 2026-11-01. An earlier draft left bracketed notes asking him to list teaching materials the items were adapted from. That list is not in this archive. Read the code and the first drafts together with "How AI tools were used": an assistant drafted them, and Dami reviewed and approved the tasks and expected answers.

## Short description
<!-- 2–4 sentences, written by Dami after the run. Template: -->
An eval of 10 single-turn tasks that test whether frontier LLMs can make the calls an experienced ESL teacher makes every day: telling a recognised World English feature (Standard Nigerian English, American English) from a learner error, tracing an error to the learner's first language (Yoruba, Spanish, Mandarin, Arabic), rating learner writing on the CEFR scale, correcting only what is wrong, explaining grammar at the learner's level, and accepting every correct answer on an ambiguous item. Models tested (free tier, 1 trial): google/gemma-4-31b-it:free, dots-studio/dots-3-note-preview:free, and a partial run of xingchen-agi/xing4.0-29b-a4b:free. Headline finding: both completed models scored well on CEFR rating and Spanish transfer errors, but both failed the Arabic (T05) and Mandarin (T04) L1-diagnosis tasks: they labelled the errors correctly yet explained the wrong cause, e.g. treating "I was play" as a misformed progressive instead of the Arabic *kāna* + imperfect habitual.

**Video walkthrough (≤ 5 min):** https://youtu.be/RIdedj__RlQ

## Domain and author expertise
- Author: Dami, English tutor on Preply. From the public Preply profile (read 2026-11-01):
  - Describes "10+ years" of teaching experience.
  - Holds Preply's "Professional Tutor" badge (a verified teaching certificate) and "Super Tutor" status.
  - Rated 5 stars from 27 student reviews.
  - Lists specialties in Conversational English, Business English, IELTS, TOEFL, English for beginners, American English, British English, Intensive English, English for traveling and job interview prep.
  - Says they specialise in teaching beginners with a structured, level-based curriculum and in preparing students for exams.
  - Describes working across Europe, North America, the Middle East and Africa.
- Dami reviewed and approved every task, expected answer and rubric item (2026-11-01).
- Why this needs an expert: each task turns on a judgment that is rarely spelled out in public material, such as the fact that Arabic *kāna* + imperfect is a past habit, so "I was play" should become "used to play", not "was playing".

## What it tests and why it matters
**Capability tested:** expert pedagogical judgment about learner English, not general grammar knowledge.

**Who relies on this:** teachers using AI to mark scripts, write feedback and answer keys; learners using AI tutors; schools and exam-prep platforms in multilingual settings such as Nigeria.

**What a failure costs:**
- Marking accepted Nigerian or American English as wrong penalises learners for their own standard variety and contradicts school policy (T01, T02, T10).
- A wrong L1 diagnosis gives the wrong fix. "Was playing" for an Arabic speaker's habitual "was play" (T05) teaches the wrong tense.
- Over-correction, such as removing singular *they* or forcing backshift, teaches learners that correct English is wrong (T07, T03, T04).
- Answer keys that list one answer get correct learner answers marked wrong (T09).
- Mis-rating CEFR levels misplaces learners into the wrong class or exam (T06).
- Explanations pitched above the learner's level, or that use false absolutes, don't help the learner (T08).

## Task overview
| ID | Category | What makes it hard |
|---|---|---|
| T01 | variety_vs_error | 4 Standard Nigerian English features vs 4 real errors; "severally" is a false friend |
| T02 | l1_diagnosis_yoruba | he/she confusion caused by Yoruba's gender-neutral pronoun; "by 5am" and "senior sister" are accepted NigE usages |
| T03 | l1_diagnosis_spanish | four Spanish transfer errors plus one correct "the students" that must not be "fixed" |
| T04 | l1_diagnosis_mandarin | 在 (zài) as a verb explains the missing "was"; comma-splice transfer; "still" is correct |
| T05 | l1_diagnosis_arabic | "I was play" = *kāna* + imperfect (habitual) → "used to play", not "was playing" |
| T06 | cefr_rating | accurate-but-simple (A2) vs ambitious-with-slips (B2); models tend to rate both B1 |
| T07 | minimal_correction | 3 real errors; 6 acceptable features that models like to "improve" |
| T08 | explanation_at_level | ≤100 words, A2 language, accurate BrE/AmE "in (the) hospital", no false absolutes |
| T09 | multiple_correct_answers | list *every* correct answer (were/was; who/whom/that/zero; is/are…) |
| T10 | variety_vs_error | AmE simple past with already/yet/just is acceptable; present perfect + "yesterday" is not |

Each task in `tasks/tasks.jsonl` has: `id`, `category`, `prompt` (exactly what the model sees), `expected_answer`, a weighted `rubric`, `pass_threshold`, `edge_case_note`, `verification_status`. Reference answers are in `reference/`; deliberately wrong answers used to test the graders are in `reference/wrong/`. The model never sees the expected answer or rubric.

## Grading
- **Output format.** Every prompt asks for a final JSON block with the exact keys being checked, so everything the grader checks is stated in the task.
- **Deterministic checks (most of the weight)** live in `graders/deterministic.py`: label matching, regex present/absent on a field, CEFR level and level ordering, exact set equality for multi-answer items (with normalisation for contractions and "zero"), and a word-count limit.
- **LLM judge** for criteria that cannot be checked by code, such as whether the L1 explanation is correct or whether the language suits A2. There is one judge call per criterion, using the specific PASS/FAIL conditions written in the task, with an `UNKNOWN` option. The prompt is in `graders/judge_prompt.md`.
  - Judge model for the free run: `nvidia/nemotron-3-ultra-550b-a55b:free` via OpenRouter, temperature 0 (reference validation earlier used `qwen/qwen3.8-max-0902`). It is deliberately from a different model family than every tested model. `run_eval.py` and `grade.py` refuse to run if the judge is also a tested model.
  - `UNKNOWN` counts as not passed and is flagged for human review.
- **Scoring.** Trial score = weighted share of criteria met (partial credit where marked). A trial **passes** if score ≥ `pass_threshold` (0.8) **and** every `critical` criterion is met. Reported metrics: mean score, pass rate, pass@k, pass^k.
- **Grader validation.** `python grade.py --validate-references` checks that every reference answer passes and every deliberately wrong answer fails. With the mock judge this tests the deterministic graders and the plumbing. Run it with the real judge too.
- **Judge reliability checks.**
  1. Stability: `grade.py --judge-repeats 2` runs each judge criterion twice. Flips are flagged and the flip rate is reported.
  2. Human agreement: `judge_agreement.py make-sheet` samples N judged items blind, Dami labels them, and `judge_agreement.py compare` reports agreement, Cohen's κ, false passes and false fails.
  - Reference validation with the real judge (2026-11-01): 10/10 reference answers pass and 10/10 wrong answers fail. That took 24 judge calls and cost $0.075.
  - Human agreement: **pending.** Blind sheet generated: `human_labels/sheet_20261101_free.csv` (28 judged items). Judge stability (flip rate) was not measured on the free run: `--judge-repeats 1` because of the free-model judge quota (50 calls/day).

## Setup and run
Tested with Python 3.13 on Linux.
```bash
python -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # add OPENROUTER_API_KEY (or export it)

# 0. keyless dry run with MOCK models (not results): pipeline + grader validation
python -m pytest -q tests

# 1. validate graders with the real judge (reference answers pass, wrong answers fail)
python grade.py --validate-references

# 2. run models (config.json: models, trials=5, temperature=0)
python run_eval.py
# 3. grade with the judge run twice for stability
python grade.py results/raw/<run_id> --judge-repeats 2
# 4. judge vs human spot check
python judge_agreement.py make-sheet results/graded/<run_id> --n 40
python judge_agreement.py compare human_labels/sheet_<run_id>.csv results/graded/<run_id>
```
To finish the pilot run started on 2026-11-01 once credits are added, run `python run_eval.py --run-id 20261101T0945Z_main`. Trials that already succeeded are skipped and failed ones are retried.

Subsets: `python run_eval.py --models anthropic/claude-opus-5.5 --tasks T05 T07 --trials 3`. Interrupted runs resume: rerun with `--run-id <same id>` and existing trials are skipped.

**Settings recorded per trial** (`results/raw/<run_id>/<model>/<task>__trialK.json`): exact messages, requested and returned model ID, provider, temperature, max_tokens, usage and cost, timestamps (UTC), and finish reason. `manifest.json` records the task-file hash and which models support `temperature` on OpenRouter. OpenAI and Anthropic reasoning models currently ignore `temperature`, so they run at the provider default, which is one reason for 5 trials.

## Models and results
Run `20261101_free`, 2026-11-01, temperature 0, max_tokens 16000, **1 trial per task** (free-tier rate limits of ~50 requests/day and frequent HTTP 429s made more trials impossible at zero cost; with k=1, pass@k = pass^k = pass rate). Judge: `nvidia/nemotron-3-ultra-550b-a55b:free`, 1 repeat. Total cost: $0.

| Model (exact OpenRouter ID) | Tasks graded | Pass rate | Mean score | Cost |
|---|---|---|---|---|
| google/gemma-4-31b-it:free | 9/10 (T07 missing: HTTP 429 on every retry) | 78% (7/9) | 0.909 | $0 |
| dots-studio/dots-3-note-preview:free | 10/10 | 60% (6/10) | 0.855 | $0 |
| xingchen-agi/xing4.0-29b-a4b:free (**partial, not comparable**) | 4/10 fully graded | 25% (1/4) | 0.604 | $0 |

xing4.0 was retried on 2026-11-01 with a 90 s timeout and finished T01–T08 and T10 (T09 hit HTTP 429 every time), but the judge's free daily quota ran out before 8 of its judge criteria (T04, T05, T06, T08, T10) were scored. Those are marked PENDING in `criteria.csv`; rerun `python grade.py results/raw/20261101_free --judge-repeats 1` later to finish them (cached verdicts are reused). Its numbers are reported for completeness only.

Per category, pass rate (gemma / dots): variety_vs_error 2/2 / 1/2; l1_diagnosis_yoruba 1/1 / 1/1; l1_diagnosis_spanish 1/1 / 1/1; **l1_diagnosis_mandarin 0/1 / 0/1; l1_diagnosis_arabic 0/1 / 0/1**; cefr_rating 1/1 / 1/1; minimal_correction – / 1/1; explanation_at_level 1/1 / 1/1; multiple_correct_answers 1/1 / 0/1. Full table: `results/graded/20261101_free/summary.md`.

**Untested: paid frontier models.** openai/gpt-6-astra, anthropic/claude-opus-5.5, google/gemini-4-argon and deepseek/deepseek-v4-pro-0813 were not run because the OpenRouter account had no credit (HTTP 402). To run them (≈$13–33):
```bash
python run_eval.py --models openai/gpt-6-astra anthropic/claude-opus-5.5 google/gemini-4-argon deepseek/deepseek-v4-pro-0813 --trials 5 --run-id paid_main
python grade.py results/raw/paid_main --judge-repeats 2
```

## Failure analysis and hot take
Quoted from `results/raw/20261101_free/`.
- **Right label, wrong reason (T05 Arabic, both models fail).** Both flagged "I was play" as an error, but gemma explained it as "over-applying 'was' to indicate the past" or "attempting to form a continuous tense", and its primary correction was "played", not the habitual "used to play". The judge noted no mention of *kāna* + imperfect. A teacher using this feedback would not teach the habit form.
- **T04 Mandarin, both fail the same way.** gemma: "Mandarin uses the negation *bù* (not) directly before adjectives or verbs without needing a copula" for "he not at home". The real cause is that 在 (zài) is itself the verb "be at" (他不在家), and the negator is 不在, not 不 + adjective. dots made the same mistake.
- **T01 Nigerian English treated as error (dots).** dots labelled "on the light" as missing a verb and said "'next tomorrow' is not a standard expression in any variety of English", marking two Standard Nigerian English features as errors. It also glossed "severally" as "in a separate manner", which is the British meaning, not the Nigerian "repeatedly". This is the exact harm the task targets: penalising a learner's own standard variety.
- **T09 one-answer answer keys (dots).** It gave only "were" for item 1 ("'was'… is not considered correct in written English") and only "is" for "Neither… is/are", so correct learner answers would be marked wrong.
- **Close call (T10 gemma).** All labels were correct, but the judge failed its teacher advice for not telling the learner to fix sentences 3 and 5.
- **Hot take:** free mid-size models know the *labels* of ESL errors but not the *mechanism*. They pass the classification checks and fail where an expert explains the L1 cause. Exactly that explanation decides the fix a learner is given.

## Cost and runtime (estimates, to be replaced with measured numbers)
Based on OpenRouter list prices on 2026-11-01. Assumptions: about 600 input tokens and 1–5k output tokens (including reasoning) per trial, and 4 models × 10 tasks × 5 trials = 200 model calls.
- Models: about **$8–25** per full run (GPT-6 Astra is most of that at $10/$50 per M tokens; DeepSeek costs under $1).
- Judge: 12 judged criteria per trial × 200 trials × 2 repeats = 480 calls, about **$5–8**.
- Wall time: about **30–75 min** at concurrency 4. The mock dry run takes under 5 s and costs $0.
- Measured (free run): $0 for models and judge; wall time spread over several hours because of free-tier rate limits (HTTP 429).

## Prior work and sources
- Built during the hackathon (Oct 30 – Nov 9, 2026): tasks, rubrics, reference answers and code. No pre-existing benchmark was copied. Dami verified the tasks and expected answers on 2026-11-01. This archive does not record which items, if any, were adapted from his own teaching materials.
- Background references. Bibliographic details were checked on 2026-11-01. These are general background; no text or tasks were copied from them.
  - Council of Europe (2020). *Common European Framework of Reference for Languages: Learning, teaching, assessment – Companion volume*. Strasbourg: Council of Europe Publishing. ISBN 978-92-871-8621-8. (T06)
  - Jowitt, D. (2019). *Nigerian English* (Dialects of English 18). Berlin/Boston: De Gruyter Mouton. doi:10.1515/9781501504600. (T01, T02)
  - Igboanusi, H. (2002). *A Dictionary of Nigerian English Usage*. Ibadan: Enicrownfit. (T01, T02)
  - Swan, M. & Smith, B. (eds.) (2001). *Learner English: A Teacher's Guide to Interference and Other Problems* (2nd ed.). Cambridge University Press. See the chapters "Speakers of Spanish and Catalan", "Arabic speakers", "Chinese speakers" and "Speakers of West African languages". (T03–T05)
  - Swan, M. (2016). *Practical English Usage* (4th ed.). Oxford University Press. (T07–T09)
  - Algeo, J. (2006). *British or American English? A Handbook of Word and Grammar Patterns*. Cambridge University Press. (T08, T10)
- Learner texts are synthetic, written for this eval. They contain no real student data.
- Harness format inspired by the micro1 participant guide. Metrics pass@k and pass^k follow Anthropic's "Demystifying evals for AI agents".

## How AI tools were used
An AI assistant (Grok Bot) drafted the harness code, the first versions of the 10 tasks, rubrics and reference answers, and this README. Every task and expected answer was marked DRAFT until Dami reviewed all 10 and approved them as written on 2026-11-01. Each task's `verification_status` records this. The graders were then checked automatically: all reference answers pass and all deliberately wrong answers fail with the real judge. The failure analysis in this README was written from that run. The raw transcript files are not in this public copy.

## Repository layout
```
tasks/tasks.jsonl          tasks, expected answers, rubrics
reference/ reference/wrong/ reference answers and deliberately wrong answers
graders/                   deterministic checks + judge prompt
run_eval.py grade.py judge_agreement.py
config.json                models, judge, trials, temperature
results/raw/ results/graded/  real runs only (results/mock/ = dry runs, gitignored, not results)
transcripts/               representative transcripts (fill after run)
human_labels/              human spot-check sheets
tests/test_dry_run.py      keyless end-to-end test with mock models
```
