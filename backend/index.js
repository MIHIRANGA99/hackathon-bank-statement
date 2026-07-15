import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { categorizeTransactions } from './src/categorization/index.js'
import { connectDB } from './src/db/connect.js'
import { Transaction, AuditLog } from './src/db/models.js'
import { saveCategorizedStatement } from './src/db/persistCategorization.js'
import { computeDashboardData } from './src/analytics/index.js'
import { computeCashflowData } from './src/analytics/cashflow.js'
import { processStatementUpload } from './src/statements/index.js'
import { logger } from './src/logger.js'
import {
  buildGoogleAuthUrl,
  buildSessionCookieHeader,
  createSessionId,
} from './src/auth/googleAuth.js'
import { handleChat } from './src/chat/handler.js'

// Uploaded statements are held in memory only and never written to disk.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } })

const app = express()
const PORT = process.env.PORT || 4000
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

const sessions = new Map()

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}))
app.use(express.json({ limit: '1mb' }))

app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    const bodySummary = req.body && Object.keys(req.body).length > 0
      ? ` body=${JSON.stringify(req.body)}`
      : ''

    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms${bodySummary}`)
  })
  next()
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/auth/google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4000/api/auth/google/callback'

  if (!clientId) {
    return res.status(500).json({ error: 'Google OAuth client id is not configured' })
  }

  const state = createSessionId()
  const authUrl = buildGoogleAuthUrl({ clientId, redirectUri, state })

  res.json({ authUrl, state })
})

app.get('/api/auth/google/callback', async (req, res) => {
  const { code, state, error } = req.query

  if (error) {
    return res.redirect(`${FRONTEND_URL}/?auth=error`)
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4000/api/auth/google/callback'

  if (!clientId || !clientSecret) {
    return res.redirect(`${FRONTEND_URL}/?auth=error`)
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.error || 'Unable to complete Google OAuth exchange')
    }

    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const profile = await profileResponse.json()

    if (!profileResponse.ok) {
      throw new Error(profile.error_description || profile.error || 'Unable to fetch Google profile')
    }

    const sessionId = createSessionId()
    sessions.set(sessionId, {
      provider: 'google',
      state,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
    })

    res.setHeader('Set-Cookie', buildSessionCookieHeader(sessionId))
    res.redirect(`${FRONTEND_URL}/dashboard`)
  } catch (error) {
    logger.error(error.message)
    res.redirect(`${FRONTEND_URL}/?auth=error`)
  }
})

app.get('/api/auth/me', (req, res) => {
  const sessionCookie = req.headers.cookie || ''
  const sessionId = sessionCookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('connect.sid='))
    ?.split('=')[1]

  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ authenticated: false })
  }

  res.json({ authenticated: true, user: sessions.get(sessionId) })
})

app.post('/api/auth/logout', (req, res) => {
  const sessionCookie = req.headers.cookie || ''
  const sessionId = sessionCookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('connect.sid='))
    ?.split('=')[1]

  if (sessionId) {
    sessions.delete(sessionId)
  }

  res.setHeader('Set-Cookie', 'connect.sid=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0')
  res.json({ success: true })
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

app.post('/api/statements/parse', upload.single('statement'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }

  try {
    const transactions = await processStatementUpload(req.file)
    res.json({ transactions })
  } catch (err) {
    logger.warn('[Statements] Failed to process upload:', err)
    const message = err.message || 'Unable to process this statement. Please check the file and try again.'
    res.status(400).json({ error: message })
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

// Multer errors (e.g. file too large) are passed to next(err), so they
// land here rather than in the route handler above.
app.use((err, req, res, next) => {
  if (!err) return next()
  logger.warn('[Statements] Upload error:', err)
  res.status(400).json({ error: err.message || 'Unable to process this statement. Please check the file and try again.' })
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
