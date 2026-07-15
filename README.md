# Account Statement Analyser

A hackathon project that analyses bank/account statements using a hybrid rule-engine + OpenAI approach for transaction categorisation.

## Stack

- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node + Express
- **AI**: OpenAI API (used only for transactions the rule engine can't categorise)

No database — all statement data is processed in memory per session only.

## Getting started

### 1. Backend

```bash
cd backend
cp .env.example .env   # then add your OPENAI_API_KEY
npm install
npm run dev
```

Backend runs on http://localhost:4000. Health check: `GET /api/health`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173.

### Running both

Open two terminals — one in `/backend` and one in `/frontend` — and run `npm run dev` in each.
