// One transaction per line: DATE  DESCRIPTION  AMOUNT  BALANCE
// Amount is signed (negative = debit, positive = credit).
const LINE_RE =
  /^(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})\s+(.+?)\s+(-?[\d,]+\.\d{2})\s+(-?[\d,]+\.\d{2})\s*$/

// Deterministic, regex-based row extraction from already-extracted (or
// OCR'd) PDF text — this is the fast path used for the vast majority of
// tabular bank statements, mirroring the rule-engine-first approach used
// for categorization. The AI extractor is only invoked as a fallback when
// this finds zero rows (an unrecognized statement layout).
export function parsePdfRows(text) {
  const rows = []
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim().replace(/\s+/g, ' ')
    const match = line.match(LINE_RE)
    if (!match) continue

    const [, date, description, amountStr, balanceStr] = match
    const amount = parseFloat(amountStr.replace(/,/g, ''))
    const balance = parseFloat(balanceStr.replace(/,/g, ''))

    rows.push({
      date,
      description: description.trim(),
      debit: amount < 0 ? Math.abs(amount) : '',
      credit: amount >= 0 ? amount : '',
      balance,
      reference: '',
    })
  }
  return rows
}
