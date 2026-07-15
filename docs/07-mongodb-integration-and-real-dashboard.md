# Requirement: MongoDB Integration + Real Dashboard

**Status:** Complete (100%)

## What was asked

Integrate MongoDB so that: (1) the DeepSeek/rule-engine categorization result gets saved to the DB as well as shown in the frontend (currently session-only), and (2) the Module 4 dashboard becomes a real, working integration instead of the mock built previously — with history accumulating across every statement uploaded, not just the most recent one.

## What was done

### Project rule change
- **`CLAUDE.md`**: the "no database" rule is now scoped correctly — categorized transaction data *is* persisted to MongoDB (that's the whole point of this module), but the raw uploaded PDF/CSV file itself is still never written to disk or DB, only the parsed/categorized result. Stack line now lists MongoDB/Mongoose alongside Express.
- **`backend/.env`** (gitignored): added `MONGODB_URI` (your real Atlas connection string — note it was pasted in this chat, so treat the password as exposed and rotate it in Atlas when convenient, same as the earlier DeepSeek key) and `MONGODB_DB_NAME=statement_analyser`.

### Backend — schema & connection (`backend/src/db/`)
- **`connect.js`** — connects once at startup (`backend/index.js`'s `start()`), reused across requests. If `MONGODB_URI` is missing/unreachable, logs a clear error but the server still starts (so `/api/health` stays reachable) — `/api/categorize` and `/api/dashboard` degrade gracefully rather than crashing the process (see below).
- **`models.js`** — three Mongoose collections:
  - `Statement` — one doc per upload: `sourceFileName`, `uploadedAt`, `transactionCount`.
  - `Transaction` — one doc per transaction, referencing its `statementId`: all the Module 1 fields (date/description/debit/credit/balance/reference) plus the categorization result (category/confidence/source/needsReview).
  - `AuditLog` — Feature 3.7's audit trail, now actually persisted: `transactionId`, `originalCategory`, `updatedCategory`, `modifiedByUser`, `modifiedDate`.
- **`persistCategorization.js`** — `saveCategorizedStatement()` inserts a new `Statement` + its `Transaction` docs after every categorize call. **Never overwrites** prior uploads — this is the "accumulate" model you chose, so the dashboard's history grows with every statement analyzed.

### Backend — endpoint changes
- **`POST /api/categorize`** (existing, Module 3) now also persists the result. Frontend must now send full transaction fields (date/balance/reference, not just description/debit/credit) plus a `sourceFileName`, since that's what gets saved. Response now includes each transaction's real Mongo `_id` (as `transactionId`) so the frontend can reference it later. If the DB write fails, categorization itself still succeeds and returns to the UI — persistence failure is logged, not fatal.
- **`PATCH /api/transactions/:id/category`** (new) — updates a transaction's category in place and writes an `AuditLog` entry. This is what makes Feature 3.5's manual corrections survive a reload instead of resetting every session.
- **`GET /api/dashboard`** — no longer returns the Module 4 mock (`mockData.js` deleted). It now queries every `Transaction` ever saved and runs real computation (see below). Returns `404` if nothing's been analyzed yet, `503` if Mongo is unreachable — the frontend's existing loading/error states already handle both.

### Backend — real analytics (`backend/src/analytics/`)
Replaces the mock with actual arithmetic over accumulated transactions (all in code, no LLM, per the project's numeric-insights rule):
- `income.js` / `expenses.js` — totals, monthly trend (grouped by `YYYY-MM`), category breakdown + ranking.
- `savings.js` — amount/rate per month + vs-last-month delta.
- `largestTransactions.js` — top 5 by debit/credit.
- `recurringPayments.js` — **heuristic, not spec-given exact numbers, documented in code**: a description counts as recurring if it appears as a debit in ≥2 distinct months with amounts within 10% of their average.
- `anomalies.js` — **heuristic, also documented in code**: a category flagged if its spend is up ≥50% vs. the previous month (only when a nonzero prior baseline exists); a single transaction flagged if it's ≥3× the account's average debit. Same threshold (≥50%) drives the "Spending Behavior" card's "Higher than usual" flag.
- `healthScore.js` — **formula, proposed default since the spec gave an example output (85/100) but no formula**: 50% savings rate (capped 0–100) + 30% anomaly penalty (100 minus 15 points per detected anomaly) + 20% income stability (100 minus the coefficient of variation of monthly income). Bands: ≥80 "Good Financial Health", ≥60 "Fair", ≥40 "Needs Attention", else "Poor".

### Frontend
- **`frontend/src/lib/categorization/api.js`** — `categorizeTransactions()` now sends full transaction fields + `sourceFileName`; new `updateTransactionCategory()` calls the `PATCH` endpoint.
- **`useCategorization.js`** — stores each transaction's `transactionId` from the categorize response; `updateCategory()` still updates local state instantly (unchanged UX) but now also fires the `PATCH` call in the background (best-effort — a failed persist doesn't block the UI, consistent with the app's existing error-tolerance pattern).
- `AnalyserPage.jsx` passes `sourceFileName` into the hook.
- Dashboard UI components (Module 4) — **no changes needed**; they already consumed exactly this response shape.

## Verification

- Backend connects to the real Atlas cluster at startup (`[MongoDB] Connected to database "statement_analyser"` in logs).
- `curl`-based test: posted 3 known transactions to `/api/categorize` → got back real Mongo `_id`s → `/api/dashboard` computed correct real totals/categories/largest-transactions from them.
- Manually `PATCH`'d one transaction's category → `/api/dashboard`'s category breakdown reflected the change immediately.
- Posted a second batch (different statement, later month) → `/api/dashboard`'s income trend showed both months and a spending-spike alert correctly fired off the two batches combined — confirming accumulation across uploads works as designed.
- Full browser pass (Playwright, temporarily installed/removed): uploaded the sample statement through the real UI, confirmed categorization + dashboard both worked end-to-end, then **loaded `/dashboard` in a fresh page load with no re-upload** and confirmed the same real numbers still appeared — the actual test that this is genuine persistence, not session-only state. No console errors.
- All test data (curl tests + the sample-statement browser test) was cleared from the real database after verification, with your explicit confirmation before each deletion, since these commands touch your live Atlas cluster.

## Deviations / notes

- Recurring-payment/anomaly thresholds and the health-score formula are original defaults (documented above and in code comments), since the spec described examples but not exact numbers — revisit if you have a specific rubric in mind.
- The MongoDB password is in `backend/.env` (gitignored) but was shared in plaintext in this chat — worth rotating in Atlas when convenient, same caveat as the earlier DeepSeek key.
