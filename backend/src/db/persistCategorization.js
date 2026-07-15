import { Statement, Transaction } from './models.js'

// Saves one upload's categorized transactions as a new batch (Statement +
// its Transactions) — never overwrites prior uploads, so the dashboard can
// aggregate across everything saved so far. Returns each transaction's
// Mongo _id keyed by the frontend's local index id, so the UI can later
// PATCH a specific transaction's category.
export async function saveCategorizedStatement(sourceFileName, transactions, results) {
  const statement = await Statement.create({
    sourceFileName: sourceFileName || 'unknown',
    transactionCount: transactions.length,
  })

  const resultsById = new Map(results.map((r) => [r.id, r]))

  const docs = transactions.map((t) => {
    const result = resultsById.get(t.id)
    return {
      statementId: statement._id,
      date: t.date,
      description: t.description,
      debit: t.debit ?? null,
      credit: t.credit ?? null,
      balance: t.balance ?? null,
      reference: t.reference,
      category: result.category,
      confidence: result.confidence,
      source: result.source,
      needsReview: result.needsReview,
    }
  })

  const inserted = await Transaction.insertMany(docs)

  return transactions.map((t, i) => ({ id: t.id, transactionId: inserted[i]._id.toString() }))
}
