const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

export class DashboardEmptyError extends Error {}

// Real MongoDB-backed analytics — see backend/src/analytics/.
export async function fetchDashboard() {
  const res = await fetch(`${API_BASE_URL}/api/dashboard`)

  if (res.status === 404) {
    throw new DashboardEmptyError('No statements analyzed yet.')
  }
  if (!res.ok) {
    throw new Error(`Dashboard request failed (${res.status})`)
  }

  return res.json()
}
