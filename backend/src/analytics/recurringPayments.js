import { mean, monthKey, normalizeDescription, round2, sum } from './helpers.js'

const MIN_OCCURRENCES = 2
const MAX_AMOUNT_VARIANCE = 0.1 // 10%

// Feature 4.6 — Recurring Payment Analysis. Heuristic (documented, not from
// the spec, since it gave examples but no exact thresholds): a description
// counts as recurring if it appears as a debit in >=2 distinct months with
// amounts within 10% of their average.
export function computeRecurringPayments(transactions) {
  const groups = new Map() // normalized description -> { originalDescription, category, amounts: [], months: Set }

  for (const t of transactions) {
    if (t.debit == null) continue
    const key = normalizeDescription(t.description)
    if (!groups.has(key)) {
      groups.set(key, {
        originalDescription: t.description,
        category: t.category,
        amounts: [],
        months: new Set(),
      })
    }
    const group = groups.get(key)
    group.amounts.push(t.debit)
    group.months.add(monthKey(t.date))
  }

  const items = []
  for (const group of groups.values()) {
    if (group.months.size < MIN_OCCURRENCES) continue

    const avg = mean(group.amounts)
    const maxDelta = Math.max(...group.amounts.map((a) => Math.abs(a - avg)))
    if (avg === 0 || maxDelta / avg > MAX_AMOUNT_VARIANCE) continue

    items.push({
      merchant: group.originalDescription,
      category: group.category,
      amount: round2(avg),
    })
  }

  items.sort((a, b) => b.amount - a.amount)
  const monthlyTotal = round2(sum(items.map((i) => i.amount)))

  return { items, monthlyTotal }
}
