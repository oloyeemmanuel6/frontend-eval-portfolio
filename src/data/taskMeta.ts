/** Titles copied from examples/esl-eval/tasks/tasks.jsonl. The prompts and expected answers stay out of the client bundle. */
export const TASK_META: readonly { id: string; title: string; short: string }[] = [
  {
    id: "T01",
    title: "Standard Nigerian English features vs genuine errors",
    short: "Nigerian English vs error",
  },
  {
    id: "T02",
    title: "Yoruba L1 transfer: gender-neutral pronoun and verb agreement",
    short: "Yoruba L1",
  },
  {
    id: "T03",
    title: "Spanish L1 transfer, including a correct segment that must not be fixed",
    short: "Spanish L1",
  },
  {
    id: "T04",
    title: "Mandarin L1 transfer, with a correct word as a trap",
    short: "Mandarin L1",
  },
  {
    id: "T05",
    title: "Arabic L1 transfer: was play as past habitual",
    short: "Arabic L1",
  },
  {
    id: "T06",
    title: "CEFR rating: accurate-but-simple vs ambitious-with-errors",
    short: "CEFR rating",
  },
  {
    id: "T07",
    title: "Minimal correction without over-correcting acceptable usage",
    short: "Minimal correction",
  },
  {
    id: "T08",
    title: "Explaining article use to an A2 learner, at A2 level",
    short: "Explanation at A2",
  },
  {
    id: "T09",
    title: "Gap-fill items with more than one correct answer",
    short: "Several correct answers",
  },
  {
    id: "T10",
    title: "American simple past with already/just/yet vs genuine present-perfect errors",
    short: "American English vs error",
  },
]

export function taskMeta(id: string): { id: string; title: string; short: string } {
  return TASK_META.find((task) => task.id === id) ?? { id, title: id, short: id }
}

const CATEGORY_LABELS: Record<string, string> = {
  variety_vs_error: "Variety vs error",
  l1_diagnosis_yoruba: "L1 diagnosis, Yoruba",
  l1_diagnosis_spanish: "L1 diagnosis, Spanish",
  l1_diagnosis_mandarin: "L1 diagnosis, Mandarin",
  l1_diagnosis_arabic: "L1 diagnosis, Arabic",
  cefr_rating: "CEFR rating",
  minimal_correction: "Minimal correction",
  explanation_at_level: "Explanation at level",
  multiple_correct_answers: "Multiple correct answers",
}

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category
}
