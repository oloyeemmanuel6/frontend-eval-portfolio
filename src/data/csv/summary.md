# Results for run 20261101_free (judge: nvidia/nemotron-3-ultra-550b-a55b:free, repeats: 1, judge cost $0.0000)

| Model | Trials/task | Mean score | Pass rate | pass@k | pass^k | Format fails | Model cost (USD) |
|---|---|---|---|---|---|---|---|
| dots-studio/dots-3-note-preview:free | 1 | 0.855 | 60% | 60% | 60% | 0 | 0 |
| google/gemma-4-31b-it:free | 1 | 0.909 | 78% | 78% | 78% | 0 | 0 |
| xingchen-agi/xing4.0-29b-a4b:free | 1 | 0.604 | 25% | 25% | 25% | 1 | 0 |

## By task (passes / trials)

| Task | dots-studio/dots-3-note-preview:free | google/gemma-4-31b-it:free | xingchen-agi/xing4.0-29b-a4b:free |
|---|---|---|---|
| T01 variety_vs_error | 0/1 | 1/1 | 0/1 |
| T02 l1_diagnosis_yoruba | 1/1 | 1/1 | 0/1 |
| T03 l1_diagnosis_spanish | 1/1 | 1/1 | 1/1 |
| T04 l1_diagnosis_mandarin | 0/1 | 0/1 | - |
| T05 l1_diagnosis_arabic | 0/1 | 0/1 | - |
| T06 cefr_rating | 1/1 | 1/1 | - |
| T07 minimal_correction | 1/1 | - | 0/1 |
| T08 explanation_at_level | 1/1 | 1/1 | - |
| T09 multiple_correct_answers | 0/1 | 1/1 | - |
| T10 variety_vs_error | 1/1 | 1/1 | - |
