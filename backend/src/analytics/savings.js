import { formatMonthLabel, round2, sortedMonthKeys, sum } from './helpers.js'

// Feature 4.3 — Savings Analysis: amount, rate, trend per month.
export function computeSavings(transactions) {
  const months = sortedMonthKeys(transactions)

  const perMonth = months.map((key) => {
    const monthTxns = transactions.filter((t) => t.date.slice(0, 7) === key)
    const income = sum(monthTxns.filter((t) => t.credit != null).map((t) => t.credit))
    const expense = sum(monthTxns.filter((t) => t.debit != null).map((t) => t.debit))
    const amount = income - expense
    const rate = income > 0 ? (amount / income) * 100 : 0
    return { month: formatMonthLabel(key), amount: round2(amount), rate: round2(rate) }
  })

  const totalIncome = sum(
    transactions.filter((t) => t.credit != null).map((t) => t.credit)
  )
  const totalExpense = sum(
    transactions.filter((t) => t.debit != null).map((t) => t.debit)
  )
  const amount = round2(totalIncome - totalExpense)
  const rate = totalIncome > 0 ? round2((amount / totalIncome) * 100) : 0

  let vsLastMonthPct = null
  if (perMonth.length >= 2) {
    const prev = perMonth[perMonth.length - 2].rate
    const curr = perMonth[perMonth.length - 1].rate
    vsLastMonthPct = round2(curr - prev)
  }

  return {
    amount,
    rate,
    vsLastMonthPct,
    trend: perMonth.map((m) => ({ month: m.month, amount: m.amount })),
  }
}
