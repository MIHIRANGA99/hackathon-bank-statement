const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

// Sends only description/debit/credit — never raw statement data or
// account numbers — to the backend for hybrid categorization.
export async function categorizeTransactions(transactions) {
  const payload = transactions.map((t, i) => ({
    id: i,
    description: t.description,
    debit: t.debit,
    credit: t.credit,
  }))

  const res = await fetch(`${API_BASE_URL}/api/categorize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactions: payload }),
  })

  if (!res.ok) {
    throw new Error(`Categorization request failed (${res.status})`)
  }

  const data = await res.json()
  return data.results
}
