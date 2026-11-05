/**
 * RFC 4180-style CSV parser. The graded criteria file quotes fields that
 * contain commas and doubled quotes, so a split-on-comma would corrupt them.
 */
export function parseCsv(text: string): Record<string, string>[] {
  const source = text.replace(/^\uFEFF/, "")
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let inQuotes = false
  let i = 0

  const pushRow = () => {
    row.push(field)
    field = ""
    const blank = row.length === 1 && row[0] === ""
    if (!blank) rows.push(row)
    row = []
  }

  while (i < source.length) {
    const char = source[i]
    if (inQuotes) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i += 1
        continue
      }
      field += char
      i += 1
      continue
    }
    if (char === '"') {
      inQuotes = true
      i += 1
      continue
    }
    if (char === ",") {
      row.push(field)
      field = ""
      i += 1
      continue
    }
    if (char === "\n" || char === "\r") {
      if (char === "\r" && source[i + 1] === "\n") i += 1
      pushRow()
      i += 1
      continue
    }
    field += char
    i += 1
  }
  if (field.length > 0 || row.length > 0) pushRow()
  if (rows.length === 0) return []

  const header = rows[0]
  return rows.slice(1).map((cells) => {
    const record: Record<string, string> = {}
    header.forEach((key, index) => {
      record[key] = cells[index] ?? ""
    })
    return record
  })
}
