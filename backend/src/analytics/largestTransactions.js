import { round2 } from './helpers.js'

const TOP_N = 5

// Feature 4.5 — Largest Transactions.
export function computeLargestTransactions(transactions) {
  const highestExpenses = transactions
    .filter((t) => t.debit != null)
    .sort((a, b) => b.debit - a.debit)
    .slice(0, TOP_N)
    .map((t) => ({ description: t.description, amount: round2(-t.debit), date: t.date }))

  const largestCredits = transactions
    .filter((t) => t.credit != null)
    .sort((a, b) => b.credit - a.credit)
    .slice(0, TOP_N)
    .map((t) => ({ description: t.description, amount: round2(t.credit), date: t.date }))

  return { highestExpenses, largestCredits }
}
