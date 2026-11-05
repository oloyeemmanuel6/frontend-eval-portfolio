export const CEFR_LEVELS = [
  {
    code: "A1",
    name: "Breakthrough",
    note: "Familiar words and very short sentences.",
  },
  {
    code: "A2",
    name: "Waystage",
    note: "Simple routine language for everyday needs.",
  },
  {
    code: "B1",
    name: "Threshold",
    note: "Can manage most travel and daily work in a simple way.",
  },
  {
    code: "B2",
    name: "Vantage",
    note: "Can develop an argument and follow a more complex text.",
  },
  {
    code: "C1",
    name: "Effective proficiency",
    note: "Flexible language for social, academic, and professional use.",
  },
  {
    code: "C2",
    name: "Mastery",
    note: "Can express fine shades of meaning.",
  },
] as const

export const CEFR_INITIAL_INDEX = 1

export type Flashcard = {
  id: string
  front: string
  back: string
}

/** Synthetic practice lines. They restate public points from the eval. They are not a student's cards. */
export const FLASHCARDS: readonly Flashcard[] = [
  {
    id: "next-tomorrow",
    front: "Standard Nigerian English: next tomorrow",
    back: "It can mean the day after tomorrow. It is a variety feature, not automatically an error.",
  },
  {
    id: "was-play",
    front: "A learner writes: I was play football every Friday.",
    back: "If the first language is Arabic, this often maps to a past habit. A better correction is used to play, not was playing.",
  },
  {
    id: "cefr-pair",
    front: "Two texts: one accurate and simple, one ambitious with slips.",
    back: "Do not collapse both to B1. Simple and accurate can be A2. Ambitious writing with slips can be B2.",
  },
  {
    id: "already-ate",
    front: "American English: I already ate.",
    back: "Simple past with already, yet, or just is acceptable in American English. Present perfect with yesterday is a different case.",
  },
]

export type ErrorSpan = {
  start: number
  end: number
  note: string
}

export type HighlighterSample = {
  id: string
  title: string
  text: string
  spans: ErrorSpan[]
}

function errorSpan(text: string, phrase: string, note: string): ErrorSpan {
  const start = text.indexOf(phrase)
  if (start < 0) throw new Error(`Phrase not in sample: ${phrase}`)
  if (text.indexOf(phrase, start + 1) !== -1) {
    throw new Error(`Phrase is ambiguous: ${phrase}`)
  }
  return { start, end: start + phrase.length, note }
}

function sample(
  id: string,
  title: string,
  text: string,
  marks: readonly { phrase: string; note: string }[],
): HighlighterSample {
  const spans = marks.map((mark) => errorSpan(text, mark.phrase, mark.note))
  const sorted = [...spans].sort((a, b) => a.start - b.start)
  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i].start < sorted[i - 1].end) {
      throw new Error(`Overlapping spans in ${id}`)
    }
  }
  return { id, title, text, spans: sorted }
}

/** Invented sentences for the canvas demo. Not student writing. */
export const HIGHLIGHTER_SAMPLES: readonly HighlighterSample[] = [
  sample(
    "habit",
    "Sample 1. Habitual past",
    "When I was a child I was play football every Friday.",
    [
      {
        phrase: "was play",
        note: "Habitual past. A teacher correction for a past habit is “used to play”, not automatically “was playing”.",
      },
    ],
  ),
  sample(
    "agreement",
    "Sample 2. Agreement",
    "She go to the market and buy rice every morning.",
    [
      {
        phrase: "She go",
        note: "Subject-verb agreement. “She go” is not a finite present form.",
      },
      {
        phrase: "buy",
        note: "The same agreement error on the second verb.",
      },
    ],
  ),
  sample(
    "since",
    "Sample 3. Since and the present",
    "I am living in London since 2019.",
    [
      {
        phrase: "am living",
        note: "With a since-time, this invented sentence is the sort of line a teacher rewrites in the present perfect.",
      },
    ],
  ),
]
