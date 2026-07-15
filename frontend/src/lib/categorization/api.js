const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

// Sends full parsed transaction fields (date/description/debit/credit/
// balance/reference — no account numbers ever exist in this data) so the
// backend can persist the categorized result, not just description/amount.
export async function categorizeTransactions(transactions, sourceFileName) {
  const payload = transactions.map((t, i) => ({
    id: i,
    date: t.date,
    description: t.description,
    debit: t.debit,
    credit: t.credit,
    balance: t.balance,
    reference: t.reference,
  }))

  const res = await fetch(`${API_BASE_URL}/api/categorize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactions: payload, sourceFileName }),
  })

  if (!res.ok) {
    throw new Error(`Categorization request failed (${res.status})`)
  }

  const data = await res.json()
  return data.results
}

// Persists a manual category correction (Feature 3.5/3.7) so it survives
// beyond the current session.
export async function updateTransactionCategory(transactionId, category) {
  const res = await fetch(`${API_BASE_URL}/api/transactions/${transactionId}/category`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category }),
  })

  if (!res.ok) {
    throw new Error(`Category update failed (${res.status})`)
  }

  return res.json()
}
