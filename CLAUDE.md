# Account Statement Analyser — Project Rules

- Stack is fixed: React + Vite + Tailwind + shadcn/ui on frontend, Node + Express on backend, DeepSeek API (via the `openai` SDK pointed at DeepSeek's OpenAI-compatible `baseURL`) for all AI features. Do not suggest or switch to a different stack or AI provider.
- No database, no ORM. All statement/transaction data lives in memory per session only — never write uploaded files or parsed data to disk.
- Categorisation must be hybrid: a deterministic rule engine first, DeepSeek only for unmatched/ambiguous transactions, batched in one request per statement. Never make categorisation pure-LLM.
- All numeric insights (totals, savings rate, cash flow, aggregates) are computed in code, never by an LLM.
- Account numbers are masked to last 4 digits everywhere — in the UI and before sending anything to DeepSeek.
- This is a hackathon build under a hard time limit: prioritise a fully working, good-looking product over abstraction, extensibility, or exhaustive error handling. Keep code simple and readable enough that any team member can explain it, but don't over-engineer.
- Do not add features beyond what's asked in each step below.
