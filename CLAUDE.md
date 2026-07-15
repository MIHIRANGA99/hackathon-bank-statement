# Account Statement Analyser — Project Rules

- Stack is fixed: React + Vite + Tailwind + shadcn/ui on frontend, Node + Express + MongoDB (via Mongoose) on backend. AI features go through the `openai` SDK pointed at an OpenAI-compatible `baseURL` — provider is chosen at runtime via `AI_PROVIDER` (`deepseek`, default, or `gemini`, via Gemini's OpenAI-compatible endpoint). Do not add a different SDK or a provider outside these two without asking first.
- Categorized transactions are persisted to MongoDB (accumulating across every statement uploaded, not just the latest) so the dashboard can compute real analytics and history survives a reload. Still never write the raw uploaded PDF/CSV file itself to disk or DB — only parsed, categorized transaction data.
- Categorisation must be hybrid: a deterministic rule engine first, the configured AI provider only for unmatched/ambiguous transactions, batched in one request per statement. Never make categorisation pure-LLM.
- All numeric insights (totals, savings rate, cash flow, aggregates) are computed in code, never by an LLM.
- Account numbers are masked to last 4 digits everywhere — in the UI and before sending anything to the AI provider.
- This is a hackathon build under a hard time limit: prioritise a fully working, good-looking product over abstraction, extensibility, or exhaustive error handling. Keep code simple and readable enough that any team member can explain it, but don't over-engineer.
- Do not add features beyond what's asked in each step below.
