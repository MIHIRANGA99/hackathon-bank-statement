const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

export class CashflowEmptyError extends Error {}

export async function fetchCashflow() {
  const res = await fetch(`${API_BASE_URL}/api/cashflow`)

  if (res.status === 404) {
    throw new CashflowEmptyError('No statements analyzed yet.')
  }
  if (!res.ok) {
    throw new Error(`Cashflow request failed (${res.status})`)
  }

  return res.json()
}
