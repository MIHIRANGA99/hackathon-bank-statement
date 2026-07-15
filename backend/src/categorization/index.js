import { matchRule } from './ruleEngine.js'
import { classifyWithAI } from './aiClassifier.js'

// Applies Feature 3.2's confidence thresholds to an AI result.
function applyConfidenceRouting(aiResult) {
  const { id, category, confidence, source } = aiResult

  if (confidence >= 80) {
    return { id, category, confidence, source, needsReview: false }
  }
  if (confidence >= 50) {
    return { id, category, confidence, source, needsReview: true }
  }
  return { id, category: 'Other', confidence, source, needsReview: true }
}

// Hybrid categorization: deterministic rules first, DeepSeek (batched,
// one request for the whole statement) only for what the rules can't
// match. Rule matches are always high-confidence and never need review.
export async function categorizeTransactions(transactions) {
  const results = new Map()
  const unmatched = []

  for (const t of transactions) {
    const ruleMatch = matchRule(t.description)
    if (ruleMatch) {
      results.set(t.id, { id: t.id, ...ruleMatch, needsReview: false })
    } else {
      unmatched.push(t)
    }
  }

  if (unmatched.length > 0) {
    const aiResults = await classifyWithAI(unmatched)
    for (const aiResult of aiResults) {
      results.set(aiResult.id, applyConfidenceRouting(aiResult))
    }
  }

  return transactions.map((t) => results.get(t.id))
}
