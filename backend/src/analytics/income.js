import { formatMonthLabel, round2, sortedMonthKeys, sum } from './helpers.js'

// Feature 4.1 — Income Analysis: total, monthly, trend + growth.
export function computeIncome(transactions) {
  const months = sortedMonthKeys(transactions)

  const trend = months.map((key) => {
    const amount = sum(
      transactions.filter((t) => t.date.slice(0, 7) === key && t.credit != null).map((t) => t.credit)
    )
    return { month: formatMonthLabel(key), amount: round2(amount) }
  })

  const total = round2(sum(trend.map((m) => m.amount)))
  const averageMonthly = months.length ? round2(total / months.length) : 0

  let growthPct = 0
  if (trend.length >= 2) {
    const prev = trend[trend.length - 2].amount
    const curr = trend[trend.length - 1].amount
    growthPct = prev > 0 ? round2(((curr - prev) / prev) * 100) : 0
  }

  return { total, averageMonthly, growthPct, trend }
}
