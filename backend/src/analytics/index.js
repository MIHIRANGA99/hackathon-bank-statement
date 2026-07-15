import { computeIncome } from './income.js'
import { computeExpenseTrend, computeCategoryBreakdown } from './expenses.js'
import { computeSavings } from './savings.js'
import { computeLargestTransactions } from './largestTransactions.js'
import { computeRecurringPayments } from './recurringPayments.js'
import { computeAnomalies, computeSpendingBehavior } from './anomalies.js'
import { computeHealthScore } from './healthScore.js'

// Orchestrates all of Module 4's analytics from the full accumulated
// transaction history (across every statement saved so far). Everything
// here is plain arithmetic over stored data — no LLM involved.
export function computeDashboardData(transactions) {
  const income = computeIncome(transactions)
  const { total: totalExpense, trend: expenseTrend } = computeExpenseTrend(transactions)
  const byCategory = computeCategoryBreakdown(transactions)
  const savings = computeSavings(transactions)
  const significantTransactions = computeLargestTransactions(transactions)
  const recurringPayments = computeRecurringPayments(transactions)
  const spendingBehavior = computeSpendingBehavior(transactions)
  const alerts = computeAnomalies(transactions)

  const healthScore = computeHealthScore({
    savingsRate: savings.rate,
    anomalyCount: alerts.length,
    monthlyIncomeAmounts: income.trend.map((m) => m.amount),
  })

  return {
    healthScore,
    income,
    expenses: { total: totalExpense, trend: expenseTrend, byCategory },
    savings,
    spendingBehavior,
    significantTransactions,
    recurringPayments,
    alerts,
  }
}
