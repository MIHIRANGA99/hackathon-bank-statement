import { mean, monthKey, round2, sortedMonthKeys, sum } from './helpers.js'

const CATEGORY_SPIKE_THRESHOLD_PCT = 50 // Feature 4.7 heuristic (documented, not spec-given)
const UNUSUAL_TRANSACTION_MULTIPLIER = 3
const MAX_UNUSUAL_TRANSACTIONS = 3

function categoryTotalsForMonth(transactions, key) {
  const totals = new Map()
  for (const t of transactions) {
    if (t.debit == null || monthKey(t.date) !== key) continue
    totals.set(t.category, (totals.get(t.category) || 0) + t.debit)
  }
  return totals
}

// Feature 4.7 — Spending Anomaly Detection, and the month-over-month
// per-category comparison used by the "Spending Behavior" card.
export function computeSpendingBehavior(transactions) {
  const months = sortedMonthKeys(transactions)
  if (months.length < 2) return []

  const currentKey = months[months.length - 1]
  const previousKey = months[months.length - 2]
  const current = categoryTotalsForMonth(transactions, currentKey)
  const previous = categoryTotalsForMonth(transactions, previousKey)

  const categories = new Set([...current.keys(), ...previous.keys()])
  const rows = []
  for (const category of categories) {
    const currentMonth = round2(current.get(category) || 0)
    const previousMonth = round2(previous.get(category) || 0)
    const changePct = previousMonth > 0 ? round2(((currentMonth - previousMonth) / previousMonth) * 100) : 0

    rows.push({
      category,
      previousMonth,
      currentMonth,
      changePct,
      flag: changePct >= CATEGORY_SPIKE_THRESHOLD_PCT ? 'Higher than usual' : null,
    })
  }

  return rows.sort((a, b) => b.currentMonth - a.currentMonth).slice(0, 5)
}

export function computeAnomalies(transactions) {
  const alerts = []
  const months = sortedMonthKeys(transactions)

  if (months.length >= 2) {
    const currentKey = months[months.length - 1]
    const previousKey = months[months.length - 2]
    const current = categoryTotalsForMonth(transactions, currentKey)
    const previous = categoryTotalsForMonth(transactions, previousKey)

    for (const [category, currentAmount] of current.entries()) {
      const previousAmount = previous.get(category) || 0
      if (previousAmount <= 0) continue
      const changePct = ((currentAmount - previousAmount) / previousAmount) * 100
      if (changePct >= CATEGORY_SPIKE_THRESHOLD_PCT) {
        alerts.push({
          type: 'spending_spike',
          title: 'Spending Alert',
          message: `Your ${category} expenses increased by ${round2(changePct)}%`,
          previousMonth: round2(previousAmount),
          currentMonth: round2(currentAmount),
          suggestion: `Consider reducing ${category.toLowerCase()} expenses by $${round2(currentAmount - previousAmount)}`,
        })
      }
    }
  }

  const debitAmounts = transactions.filter((t) => t.debit != null).map((t) => t.debit)
  const avgDebit = mean(debitAmounts)
  if (avgDebit > 0) {
    const unusual = transactions
      .filter((t) => t.debit != null && t.debit >= avgDebit * UNUSUAL_TRANSACTION_MULTIPLIER)
      .sort((a, b) => b.debit - a.debit)
      .slice(0, MAX_UNUSUAL_TRANSACTIONS)

    for (const t of unusual) {
      alerts.push({
        type: 'unusual_transaction',
        title: 'Unusual Transaction Detected',
        message: 'Large payment detected',
        merchant: t.description,
        amount: round2(t.debit),
        multiplier: round2(t.debit / avgDebit),
      })
    }
  }

  return alerts
}
