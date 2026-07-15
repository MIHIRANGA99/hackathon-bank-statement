import { GoogleGenAI } from '@google/genai'
import { Transaction } from '../db/models.js'
import { computeDashboardData } from '../analytics/index.js'
import { computeCashflowData } from '../analytics/cashflow.js'

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

// In-memory session store: sessionId -> chat object
const sessions = new Map()

async function buildFinancialContext() {
  const transactions = await Transaction.find().sort({ date: 1 }).lean()
  if (transactions.length === 0) return null

  const dashboard = computeDashboardData(transactions)
  const cashflow = computeCashflowData(transactions)

  // Category-level totals for ALL transactions (expenses only)
  const categoryTotals = {}
  for (const t of transactions) {
    if (t.debit != null) {
      if (!categoryTotals[t.category]) categoryTotals[t.category] = { spent: 0, count: 0 }
      categoryTotals[t.category].spent += t.debit
      categoryTotals[t.category].count++
    }
  }

  // Keep only last 20 transactions to limit token usage
  const recentTx = transactions.slice(-20)

  return {
    transactionCount: transactions.length,
    dateRange: { from: transactions[0]?.date, to: transactions[transactions.length - 1]?.date },
    dashboard,
    cashflow,
    categoryTotals,
    recentTx,
  }
}

function buildSystemPrompt(ctx) {
  if (!ctx) {
    return `You are FinAnalytica's AI Financial Assistant.
No bank statement data has been uploaded yet. Ask the user to upload a statement first.
You can still answer general financial literacy questions.`
  }

  const { transactionCount, dateRange, dashboard, cashflow, categoryTotals, recentTx } = ctx

  // Top 8 categories only to limit prompt size
  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1].spent - a[1].spent)
    .slice(0, 8)
    .map(([cat, d]) => `${cat}: $${d.spent.toFixed(2)} (${d.count} txns)`)
    .join(', ')

  // Monthly income vs expense (last 6 months)
  const monthlyIncome = (dashboard.income?.trend || []).slice(-6)
  const monthlyExpense = (dashboard.expenses?.trend || []).slice(-6)
  const monthlyLines = monthlyIncome.map((m, i) => {
    const exp = monthlyExpense[i]?.amount ?? 0
    return `${m.month}: In $${m.amount} Out $${exp} Net $${(m.amount - exp).toFixed(2)}`
  }).join(' | ')

  // Recurring payments
  const recurring = (dashboard.recurringPayments?.items || [])
    .slice(0, 6)
    .map((r) => `${r.merchant} ~$${r.amount}/mo`)
    .join(', ') || 'None detected'

  // Recent transactions (compact, 20 max)
  const recentLines = recentTx.map((t) =>
    `${t.date} | ${t.description.slice(0, 35)} | ${t.debit != null ? `-$${t.debit}` : `+$${t.credit}`} | ${t.category}`
  ).join('\n')

  return `You are FinAnalytica's AI Financial Assistant. Answer concisely using the data below.

SUMMARY: ${transactionCount} transactions from ${dateRange.from} to ${dateRange.to}
HEALTH SCORE: ${dashboard.healthScore?.score}/100 (${dashboard.healthScore?.label})
TOTAL INCOME: $${dashboard.income?.total} | AVG MONTHLY: $${dashboard.income?.averageMonthly}
TOTAL EXPENSES: $${dashboard.expenses?.total}
SAVINGS: $${dashboard.savings?.amount} (${dashboard.savings?.rate}% rate)
CASHFLOW NOW: In $${cashflow?.summary?.income} Out $${cashflow?.summary?.expenses} Net $${cashflow?.summary?.net} Balance $${cashflow?.summary?.closingBalance}
TOP CATEGORIES: ${topCategories}
RECURRING: ${recurring}
MONTHLY (last 6): ${monthlyLines}

RECENT TRANSACTIONS:
${recentLines}

You can answer: transaction queries, financial health, forecasts, recommendations, and what-if simulations.
For what-if simulations, do the math from the real figures above.`
}

export async function handleChat(sessionId, question) {
  const ctx = await buildFinancialContext()
  const systemPrompt = buildSystemPrompt(ctx)

  if (!sessions.has(sessionId)) {
    const chat = genAI.chats.create({
      model: 'gemini-2.0-flash',
      config: { systemInstruction: systemPrompt },
    })
    sessions.set(sessionId, chat)
  }

  const chat = sessions.get(sessionId)
  try {
    const response = await chat.sendMessage({ message: question })
    return response.text ?? 'I could not generate a response. Please try again.'
  } catch (err) {
    const errStr = JSON.stringify(err)
    if (errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED')) {
      sessions.delete(sessionId)
      throw new Error('The AI service is temporarily rate-limited. Please wait a moment and try again.')
    }
    throw err
  }
}
