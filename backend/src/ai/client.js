import OpenAI from 'openai'

const PROVIDERS = {
  deepseek: {
    apiKey: () => process.env.DEEPSEEK_API_KEY,
    baseURL: () => process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
    model: () => process.env.DEEPSEEK_MODEL || 'deepseek-chat',
  },
  gemini: {
    // Gemini exposes an OpenAI-compatible endpoint, so it plugs into the
    // same `openai` SDK used for DeepSeek — no extra SDK dependency.
    apiKey: () => process.env.GEMINI_API_KEY,
    baseURL: () => process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/',
    model: () => process.env.GEMINI_MODEL || 'gemini-flash-latest',
  },
}

// Selects the AI provider for all AI features (categorization + statement
// extraction) via AI_PROVIDER=deepseek|gemini, defaulting to deepseek.
// Both providers are used through the same OpenAI-compatible SDK/shape.
export function getAIProvider() {
  const name = (process.env.AI_PROVIDER || 'deepseek').toLowerCase()
  const provider = PROVIDERS[name]
  if (!provider) {
    throw new Error(`Unknown AI_PROVIDER "${name}" — expected "deepseek" or "gemini"`)
  }

  const client = new OpenAI({
    apiKey: provider.apiKey(),
    baseURL: provider.baseURL(),
  })

  return { name, client, model: provider.model(), baseURL: provider.baseURL() }
}
