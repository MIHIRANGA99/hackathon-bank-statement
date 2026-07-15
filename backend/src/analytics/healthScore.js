import { mean, round2 } from './helpers.js'

// Financial Health Score — a documented, transparent formula (the spec gave
// an example output, 85/100, but no formula; this is a proposed default,
// not derived from the spec):
//   50% savings rate (capped 0-100)
// + 30% anomaly penalty (100, minus 15 points per detected anomaly, floor 0)
// + 20% income stability (100 minus the coefficient of variation of monthly
//   income, as a percentage — steadier income scores higher)
const WEIGHTS = { savings: 0.5, anomalies: 0.3, stability: 0.2 }
const PENALTY_PER_ANOMALY = 15

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

function labelFor(score) {
  if (score >= 80) return 'Good Financial Health'
  if (score >= 60) return 'Fair Financial Health'
  if (score >= 40) return 'Needs Attention'
  return 'Poor Financial Health'
}

export function computeHealthScore({ savingsRate, anomalyCount, monthlyIncomeAmounts }) {
  const savingsComponent = clamp(savingsRate, 0, 100)
  const anomalyComponent = clamp(100 - anomalyCount * PENALTY_PER_ANOMALY, 0, 100)

  let stabilityComponent = 100
  if (monthlyIncomeAmounts.length >= 2) {
    const avg = mean(monthlyIncomeAmounts)
    if (avg > 0) {
      const variance = mean(monthlyIncomeAmounts.map((x) => (x - avg) ** 2))
      const cv = Math.sqrt(variance) / avg
      stabilityComponent = clamp(100 - cv * 100, 0, 100)
    }
  }

  const score = Math.round(
    savingsComponent * WEIGHTS.savings +
      anomalyComponent * WEIGHTS.anomalies +
      stabilityComponent * WEIGHTS.stability
  )

  return { score: clamp(score, 0, 100), label: labelFor(score) }
}
