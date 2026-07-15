import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { categorizeTransactions } from './src/categorization/index.js'
import { MOCK_DASHBOARD_DATA } from './src/dashboard/mockData.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.post('/api/categorize', async (req, res) => {
  const { transactions } = req.body || {}
  if (!Array.isArray(transactions)) {
    return res.status(400).json({ error: 'transactions must be an array' })
  }

  const results = await categorizeTransactions(transactions)
  res.json({ results })
})

// Mock for now — will be replaced by a real MongoDB-backed aggregation in a
// future module. Shape is the contract the frontend dashboard is built against.
app.get('/api/dashboard', (req, res) => {
  res.json(MOCK_DASHBOARD_DATA)
})

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`)
})
