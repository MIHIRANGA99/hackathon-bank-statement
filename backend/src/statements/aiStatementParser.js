import { logger } from '../logger.js'
import { maskAccountNumbers } from './mask.js'
import { getAIProvider } from '../ai/client.js'

function buildPrompt(text) {
  return `You are a bank statement parser. Extract every transaction row from the raw statement text below into a JSON array. Ignore headers, footers, page numbers, and any summary/total lines that are not individual transactions.

Each transaction object must have exactly these fields:
- "date": the transaction date exactly as it appears in the text
- "description": the transaction description/narrative
- "debit": the debit/withdrawal amount as a number, or null if this transaction is a credit
- "credit": the credit/deposit amount as a number, or null if this transaction is a debit
- "balance": the running balance as a number, or null if not present
- "reference": a reference/transaction id if present, or null

Statement text:
"""
${text}
"""

Respond with ONLY a JSON array, no other text, in this exact shape:
[{"date": "<date>", "description": "<description>", "debit": <number|null>, "credit": <number|null>, "balance": <number|null>, "reference": <string|null>}]`
}

// Extracts structured transaction rows from raw PDF statement text using
// DeepSeek, in a single request for the whole statement. Account numbers
// are masked before the text ever leaves the process. Unlike
// categorization, there is no safe fallback for a statement the AI
// couldn't parse at all, so this throws on any failure.
export async function extractTransactionsWithAI(rawText) {
  const maskedText = maskAccountNumbers(rawText)

  const { name, client, model, baseURL } = getAIProvider()
  logger.info(`[AI:${name}] Calling ${baseURL} to extract transactions from statement text`)

  const response = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: buildPrompt(maskedText) }],
    temperature: 0,
  })

  logger.debug(`[AI:${name}] Call succeeded, raw response:`, response.choices?.[0]?.message?.content)

  const raw = response.choices?.[0]?.message?.content?.trim() || ''
  const jsonText = raw.replace(/^```json\s*|^```\s*|```$/g, '').trim()
  const parsed = JSON.parse(jsonText)

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('Unable to process this statement. Please check the file and try again.')
  }

  return parsed.map((row) => ({
    date: row.date ?? '',
    description: row.description ?? '',
    debit: row.debit ?? '',
    credit: row.credit ?? '',
    balance: row.balance ?? '',
    reference: row.reference ?? '',
  }))
}
