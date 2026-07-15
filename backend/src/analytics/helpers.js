const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export function monthKey(dateStr) {
  return String(dateStr || '').slice(0, 7) // YYYY-MM
}

export function formatMonthLabel(key) {
  const [year, month] = key.split('-')
  const idx = Number(month) - 1
  return `${MONTH_NAMES[idx] ?? month} ${year}`
}

export function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

export function sum(arr) {
  return arr.reduce((a, b) => a + b, 0)
}

export function mean(arr) {
  return arr.length ? sum(arr) / arr.length : 0
}

export function normalizeDescription(description) {
  return String(description || '').trim().toLowerCase()
}

// Sorted list of distinct YYYY-MM keys present in the data.
export function sortedMonthKeys(transactions) {
  return Array.from(new Set(transactions.map((t) => monthKey(t.date)))).sort()
}
