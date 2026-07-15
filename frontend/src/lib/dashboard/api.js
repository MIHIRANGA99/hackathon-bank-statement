const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

// Backed by a mock endpoint for now — see backend/src/dashboard/mockData.js.
// Will point at a real MongoDB-backed aggregation in a future module; the
// response shape is the contract this UI is already built against.
export async function fetchDashboard() {
  const res = await fetch(`${API_BASE_URL}/api/dashboard`)
  if (!res.ok) {
    throw new Error(`Dashboard request failed (${res.status})`)
  }
  return res.json()
}
