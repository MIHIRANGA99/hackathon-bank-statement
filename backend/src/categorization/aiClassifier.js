import { CATEGORIES } from './categories.js'
import { logger } from '../logger.js'
import { getAIProvider } from '../ai/client.js'

function buildPrompt(transactions) {
  const list = transactions
    .map((t) => `${t.id}: "${t.description}" (${t.debit != null ? 'debit' : 'credit'})`)
    .join('\n')

  return `You are a bank transaction categorizer. Classify each transaction below into exactly one of these categories: ${CATEGORIES.join(', ')}.

Transactions:
${list}

Respond with ONLY a JSON array, no other text, in this exact shape:
[{"id": <id>, "category": "<one of the categories above>", "confidence": <0-100 integer>}]`
}

// Classifies a batch of transactions the rule engine couldn't match.
// Never throws — on any failure (bad key, network, malformed response)
// every transaction in the batch falls back to Other/0 so the request
// never breaks the categorization flow.
export async function classifyWithAI(transactions) {
  if (transactions.length === 0) return []

  const fallback = transactions.map((t) => ({
    id: t.id,
    category: 'Other',
    confidence: 0,
    source: 'ai-error',
  }))

  try {
    const { name, client, model, baseURL } = getAIProvider()
    logger.info(`[AI:${name}] Calling ${baseURL} to classify ${transactions.length} transaction(s)`)

    const response = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: buildPrompt(transactions) }],
      temperature: 0,
    })

    logger.debug(`[AI:${name}] Call succeeded, raw response:`, response.choices?.[0]?.message?.content)

    const raw = response.choices?.[0]?.message?.content?.trim() || ''
    const jsonText = raw.replace(/^```json\s*|^```\s*|```$/g, '').trim()
    const parsed = JSON.parse(jsonText)

    if (!Array.isArray(parsed)) return fallback

    const byId = new Map(parsed.map((r) => [r.id, r]))
    return transactions.map((t) => {
      const result = byId.get(t.id)
      if (!result || !CATEGORIES.includes(result.category)) {
        return { id: t.id, category: 'Other', confidence: 0, source: 'ai-error' }
      }
      const confidence = Number(result.confidence)
      return {
        id: t.id,
        category: result.category,
        confidence: Number.isFinite(confidence) ? confidence : 0,
        source: 'ai',
      }
    })
  } catch (err) {
    logger.warn('[AI] Call failed, falling back to Other:', err)
    return fallback
  }
}
