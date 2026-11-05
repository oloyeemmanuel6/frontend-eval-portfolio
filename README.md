# Dami — English teaching and task design

Personal site for Dami, an ESL tutor on Preply and the person behind the YouTube channel English At Your Service. It publishes the ESL Teaching Judgment Eval (free-tier run of 1 Nov 2026) and three self-initiated frontend task samples.

This is a static React + TypeScript + Vite site. It is prepared for GitHub Pages. It is not deployed from this archive, and it does not claim a GitHub profile. No API keys, accounts, or paid services are required.

The frontend work, including the SVG mockups, is a self-initiated, AI-assisted demonstration. It is not client work and not an official micro1 site. Dami verified the eval’s tasks and expected answers on 1 Nov 2026. An assistant drafted the harness and the first task versions. See `examples/esl-eval/README.md`.

## Run it locally

Node.js 22 and Python 3 (used only to zip the downloads). No environment variables.

```bash
npm ci
npm run dev
```

Open http://127.0.0.1:43123 . The dev server binds to that port on purpose.

```bash
npm test          # vitest: CSV parser and the published denominators
npm run lint      # oxlint
npm run build     # typecheck, pack downloads, production build
npm run preview -- --host 127.0.0.1 --port 4173
npm run test:e2e  # Playwright against a production preview, desktop and mobile
npm run check:base
```

`npm run check:base` rebuilds with `VITE_BASE=/frontend-eval-portfolio/` and checks that `dist/index.html` and `dist/404.html` carry that prefix, and that the zip and mockup files were copied into `dist`.

Playwright uses the Chrome already installed on the machine (`channel: "chrome"`). If Chrome is missing, install it or set Playwright’s channel to a browser you have.

## GitHub Pages

The workflow is `.github/workflows/pages.yml`. It runs the unit tests, lint, and `npm run build`, then deploys `dist` with GitHub’s Pages actions.

Before the first deploy, in the GitHub repository settings:

1. Create the public repository yourself and push this project. This archive does not name an owner.
2. Settings → Pages → Build and deployment → Source: GitHub Actions.
3. Push to `main`, or run the workflow by hand.

The base path is chosen at build time by `src/basePath.ts`:

| Site | What to set | Resulting base |
|---|---|---|
| Project site `https://OWNER.github.io/REPO/` | Leave `VITE_BASE` unset. The workflow passes `GITHUB_REPOSITORY`. | `/REPO/` |
| User site `https://OWNER.github.io/` | Repository named `OWNER.github.io` | `/` |
| Any other prefix | Repository variable or workflow env `VITE_BASE=/name/` | that prefix |

`VITE_BASE` wins over the repository name. Local `npm run dev` and `npm run build` use `/` unless you set `VITE_BASE`.

Deep links such as `/results` need the copied `404.html`. GitHub Pages serves that file for unknown paths and leaves the URL in place, so the React router can read it. Asset URLs are prefixed with the base, including the favicon (`%BASE_URL%` in `index.html`) and files linked with `publicUrl()`.

Preview a project-site build locally:

```bash
VITE_BASE=/frontend-eval-portfolio/ npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Then open http://127.0.0.1:4173/frontend-eval-portfolio/ .

There is no analytics, no backend, and no form. Do not add an API key. `examples/esl-eval/.env.example` is an empty OpenRouter field from the eval archive. Leave it empty.

## What the pages are

- **Home** shows the three recorded means and the pass grid.
- **Results** is the dashboard: SVG chart, pass grid, and criterion drill-down, all from the CSVs in `src/data/csv/` (the same files as `examples/esl-eval/results/graded/20261101_free/`).
- **Eval** is the case study. The walkthrough video is https://youtu.be/RIdedj__RlQ .
- **Task samples** are the CEFR gauge, the flashcards, and the canvas highlighter, plus a review of the gauge task.
- **About** lists the facts that are actually on record. It does not offer a contact form.

## How the scores are counted

`grade.py` keeps a trial in the headline mean only when `judge_complete` is true and `error` is empty. This site uses that rule.

| Model | In the mean | Passed | Mean | Left out |
|---|---|---|---|---|
| Dots 3 Note | 10 | 6/10 | 0.855 | none |
| Gemma 4 31B | 9 | 7/9 | 0.909 | T07, HTTP 429 |
| Xing 4.0 | 4 | 1/4 | 0.604 | five judge-pending trials, and T09 HTTP 429 |

Xing is a partial run. It is not a ranking against the two models that finished. One trial means pass@k equals the pass rate. That is not a stability estimate. Human agreement with the judge is pending. `summary_by_model.csv` shows `api_errors` as 0 because that column is counted only on rows that already have an empty error. The 429s are still on the score rows and on the grid, marked Missing.

The unit test `src/data/evalResults.test.ts` fails if a recomputed mean drifts from `summary_by_model.csv`. The page shows both numbers if they ever disagree. It does not replace one with the other.

## Task samples

Each sample has:

- an SVG mockup in `content/tasks/<name>/mockup.svg`
- `TASK.md`, `SUCCESS_CRITERIA.md`, and `VERIFICATION.md`
- a reference component under `src/components/`
- a Playwright file under `e2e/`

`npm run dev` and `npm run build` run `scripts/pack_assets.py`, which copies those files to `public/task-assets/` and writes the zips in `public/downloads/`. The buttons on the site point at those files.

`content/tasks/review/REVIEW.md` critiques the CEFR gauge task: the mockup is one state, the contract is the criteria file, and pixel equality is not a pass condition. The note was written with the task. It is not a second person’s sign-off.

The mockups were authored as SVG. They were not drawn by hand by Dami.

## For an interview, in this order

1. **What is yours to explain.** The eval’s teaching calls, because you verified the tasks and expected answers. The site’s shape: a static Vite app, the CSV rule above, and what each Playwright file locks. Say the interface code and the mockups were produced with an AI assistant for this demonstration. Do not describe them as an earlier professional frontend job, a client delivery, or an unaided authorship of the harness.

2. **Why the numbers look the way they do.** Open `examples/esl-eval/grade.py` and find `summarize`. The included list is `judge_complete and not error`. Walk Gemma T07 (429, out), Xing T04 (judge pending, out), and Xing T01 (format fail, judge finished, in, and it fails). The denominator is the number of included trials, which is why Gemma is 7/9.

3. **How a task sample is graded.** Pick the CEFR gauge. The mockup shows B2. The component starts at A2. The criteria say so, and `e2e/cefr-gauge.spec.ts` presses Arrow Right, Home, End, and the B2 button. Mention the review note: a screenshot diff would grade the wrong thing.

4. **How the Pages base works.** `resolveBase` in `src/basePath.ts`. A project site is `/repository-name/`. A repository named `owner.github.io` is `/`. `publicUrl()` prefixes download links. `dist/404.html` is a copy of `index.html` so a refresh on `/results` still loads the app.

5. **What you would not claim.** A hackathon score (none is known). A GitHub history this archive does not contain. Employment at micro1. Years of professional frontend work. Paid-model results. Human–judge agreement (still pending).

## Layout of the repo

```
src/                  React app
src/data/csv/         graded export used by the dashboard
content/tasks/        mockups, specs, criteria, verification, review
examples/esl-eval/    sanitized eval source and the same graded CSVs
e2e/                  Playwright acceptance tests
scripts/pack_assets.py
scripts/check_base.py
.github/workflows/pages.yml
```

The placeholder referer `https://github.com/esl-eval` was removed from `examples/esl-eval/esl_eval/common.py`. It was not an account. The live header is a non-resolving example address.

## Optional: the original Python tests

The eval’s keyless dry run is separate from the site:

```bash
cd examples/esl-eval
python -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
python -m pytest -q tests
```

That does not call a paid model. It is not part of `npm test`.
