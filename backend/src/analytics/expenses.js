import { formatMonthLabel, round2, sortedMonthKeys, sum } from './helpers.js'

// Feature 4.2 — Expense Analysis: total, monthly, trend.
export function computeExpenseTrend(transactions) {
  const months = sortedMonthKeys(transactions)

  const trend = months.map((key) => {
    const amount = sum(
      transactions.filter((t) => t.date.slice(0, 7) === key && t.debit != null).map((t) => t.debit)
    )
    return { month: formatMonthLabel(key), amount: round2(amount) }
  })

  const total = round2(sum(trend.map((m) => m.amount)))
  return { total, trend }
}

// Feature 4.4 — Category Analysis: ranked spend by category with %.
export function computeCategoryBreakdown(transactions) {
  const totals = new Map()
  for (const t of transactions) {
    if (t.debit == null) continue
    totals.set(t.category, (totals.get(t.category) || 0) + t.debit)
  }

  const totalExpense = sum(Array.from(totals.values()))
  const byCategory = Array.from(totals.entries())
    .map(([category, amount]) => ({
      category,
      amount: round2(amount),
      pct: totalExpense > 0 ? round2((amount / totalExpense) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)

  return byCategory
}
