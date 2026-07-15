import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { categorizeTransactions } from './src/categorization/index.js'
import { connectDB } from './src/db/connect.js'
import { Transaction, AuditLog } from './src/db/models.js'
import { saveCategorizedStatement } from './src/db/persistCategorization.js'
import { computeDashboardData } from './src/analytics/index.js'
import { computeCashflowData } from './src/analytics/cashflow.js'
import { handleChat } from './src/chat/handler.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.post('/api/categorize', async (req, res) => {
  const { transactions, sourceFileName } = req.body || {}
  if (!Array.isArray(transactions)) {
    return res.status(400).json({ error: 'transactions must be an array' })
  }

  const results = await categorizeTransactions(transactions)

  let persisted = []
  try {
    persisted = await saveCategorizedStatement(sourceFileName, transactions, results)
  } catch (err) {
    console.warn('[MongoDB] Failed to persist categorized statement:', err.message)
  }
  const transactionIdById = new Map(persisted.map((p) => [p.id, p.transactionId]))

  res.json({
    results: results.map((r) => ({ ...r, transactionId: transactionIdById.get(r.id) || null })),
  })
})

// Persists a manual category correction (Feature 3.5/3.7).
app.patch('/api/transactions/:id/category', async (req, res) => {
  const { category } = req.body || {}
  if (!category) {
    return res.status(400).json({ error: 'category is required' })
  }

  try {
    const existing = await Transaction.findById(req.params.id)
    if (!existing) {
      return res.status(404).json({ error: 'transaction not found' })
    }

    const originalCategory = existing.category
    existing.category = category
    existing.confidence = 100
    existing.source = 'user'
    existing.needsReview = false
    await existing.save()

    await AuditLog.create({
      transactionId: existing._id,
      originalCategory,
      updatedCategory: category,
      modifiedByUser: true,
    })

    res.json({ ok: true })
  } catch (err) {
    console.warn('[MongoDB] Failed to update transaction category:', err.message)
    res.status(500).json({ error: 'failed to update category' })
  }
})

// Real Module 4 analytics, computed from every transaction saved so far
// across all accumulated uploads.
app.get('/api/dashboard', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: 1 }).lean()
    if (transactions.length === 0) {
      return res.status(404).json({ error: 'No statements analyzed yet.' })
    }
    res.json(computeDashboardData(transactions))
  } catch (err) {
    console.warn('[MongoDB] Failed to compute dashboard:', err.message)
    res.status(503).json({ error: 'Dashboard data is temporarily unavailable.' })
  }
})

app.get('/api/cashflow', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: 1 }).lean()
    if (transactions.length === 0) {
      return res.status(404).json({ error: 'No statements analyzed yet.' })
    }
    res.json(computeCashflowData(transactions))
  } catch (err) {
    console.warn('[MongoDB] Failed to compute cashflow analysis:', err.message)
    res.status(503).json({ error: 'Cashflow data is temporarily unavailable.' })
  }
})

// Module 6 — AI Financial Assistant
app.post('/api/chat', async (req, res) => {
  const { sessionId, question } = req.body || {}
  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'question is required' })
  }
  try {
    const answer = await handleChat(sessionId || 'default', question.trim())
    res.json({ answer })
  } catch (err) {
    console.error('[Chat] Error:', err.message)
    res.status(500).json({ error: 'Failed to generate a response. Please try again.' })
  }
})

async function start() {
  try {
    await connectDB()
  } catch (err) {
    console.error('[MongoDB] Connection failed — categorize/dashboard endpoints will not work:', err.message)
  }

  app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`)
  })
}

start()
