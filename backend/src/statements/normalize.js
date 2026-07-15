// Normalizes a "date" string to ISO format (YYYY-MM-DD).
// Tolerates DD/MM/YYYY and YYYY-MM-DD source formats.
export function normalizeDate(raw) {
  const value = String(raw ?? '').trim()

  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (iso) return value

  const slash = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (slash) {
    const [, dd, mm, yyyy] = slash
    return `${yyyy}-${mm}-${dd}`
  }

  return value
}

// Standardizes a currency-ish value to a plain number, or null if empty.
// Strips currency symbols/commas, handles a trailing minus or
// parenthesised negative amounts, e.g. "(85.40)" -> -85.4.
export function normalizeAmount(raw) {
  if (raw === null || raw === undefined) return null
  const value = String(raw).trim()
  if (value === '') return null

  let isNegative = false
  let cleaned = value

  if (/^\(.*\)$/.test(cleaned)) {
    isNegative = true
    cleaned = cleaned.slice(1, -1)
  }
  if (cleaned.trim().startsWith('-')) {
    isNegative = true
  }

  cleaned = cleaned.replace(/[^0-9.]/g, '')
  if (cleaned === '') return null

  const num = parseFloat(cleaned)
  if (Number.isNaN(num)) return null

  return isNegative ? -Math.abs(num) : num
}

// Trims/collapses whitespace. If the whole description is shouty (all
// caps) or all lowercase, title-cases it for consistency — otherwise
// leaves mixed-case text (which may contain acronyms like "ATM") as-is.
export function normalizeDescription(raw) {
  const trimmed = String(raw ?? '').trim().replace(/\s+/g, ' ')
  if (!trimmed) return trimmed

  const isAllUpper = trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)
  const isAllLower = trimmed === trimmed.toLowerCase() && /[a-z]/.test(trimmed)

  if (isAllUpper || isAllLower) {
    return trimmed.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
  }
  return trimmed
}

// Runs a list of raw (source-shaped) transaction rows through
// normalization and returns the final structured transaction list.
export function normalizeTransactions(rawRows) {
  return rawRows.map((row, i) => {
    const debit = normalizeAmount(row.debit)
    const credit = normalizeAmount(row.credit)
    const balance = normalizeAmount(row.balance)
    const reference = String(row.reference ?? '').trim()

    return {
      date: normalizeDate(row.date),
      description: normalizeDescription(row.description),
      debit,
      credit,
      balance,
      reference: reference || `REF-${i + 1}`,
    }
  })
}
