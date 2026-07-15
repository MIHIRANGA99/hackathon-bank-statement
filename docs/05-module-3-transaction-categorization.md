# Requirement: Module 3 — Transaction Categorization & Review Engine

**Status:** Complete (100%)

## What was asked

A hybrid categorization engine (deterministic rules first, AI for the rest) with confidence-based auto-categorize/review/Other routing, 16 predefined categories, manual per-transaction and bulk category editing, an audit trail of user corrections, session-based learning from corrections, and dashboard summary cards (Review Needed count, Categorization Accuracy). AI provider switched from OpenAI to **DeepSeek** per this session's direction, and — per your explicit answers to the two clarifying questions asked before building — the AI receives Module 1's already-parsed transactions (not the raw file), and the dashboard cards live on the Analyser page (not the Dashboard route).

## What was done

### Project rule change
- **`CLAUDE.md`**: the fixed-stack line now says DeepSeek (via the `openai` SDK pointed at DeepSeek's OpenAI-compatible `baseURL`) instead of OpenAI, and the categorisation rule now says "DeepSeek only for unmatched/ambiguous transactions, batched in one request per statement."
- **`backend/.env`** (gitignored) / **`.env.example`**: `DEEPSEEK_API_KEY` (holds the mock key you provided — rotate before using a real one, since the mock value passed through this chat) and `DEEPSEEK_BASE_URL=https://api.deepseek.com`.

### Backend (`backend/src/categorization/`)
- **`categories.js`** — the 16 predefined categories. *Deviation:* the spec's Feature 3.3 list says "Others" but every other feature (3.2/3.4/3.5/dashboard) says "Other" — standardized on **"Other"** as the single bucket name throughout.
- **`ruleEngine.js`** — keyword/merchant → category map (Uber→Transport, Netflix→Subscriptions, Electric Co→Utilities, etc.), checked first. Generic unknown-transaction patterns (`POS PAYMENT`, `CARD PURCHASE`, `ATM TRANSACTION`, `EFT TRANSFER`, `UNKNOWN MERCHANT` — Feature 3.4) resolve straight to `Other` without ever reaching the AI step.
- **`aiClassifier.js`** — batches every rule-unmatched transaction from one statement into a *single* DeepSeek chat completion, asking for strict JSON `{id, category, confidence}` per transaction. Never throws: a bad key, network failure, or malformed response falls every transaction in the batch back to `{category: 'Other', confidence: 0, source: 'ai-error'}` so a categorization failure can't break the app; a `console.warn` logs the real error for dev visibility.
- **`index.js`** — orchestrates rule-engine-first / AI-for-the-rest, then applies Feature 3.2's confidence routing: `≥80` auto-categorize (`needsReview: false`), `50–79` keep the AI's category but `needsReview: true`, `<50` forced to `Other` with `needsReview: true`. Rule matches are always 100% confidence and never need review.
- **`POST /api/categorize`** in `backend/index.js` — accepts `{ transactions: [{id, description, debit, credit}] }` (no full statement data, no account numbers) and returns `{ results: [{id, category, confidence, source, needsReview}] }`.

### Frontend (`frontend/src/lib/categorization/`)
- **`categories.js`** — mirrors the backend list (two small npm projects, no shared package, so this is kept in sync manually — noted as a deviation/tradeoff for hackathon speed).
- **`api.js`** — `categorizeTransactions()` posts only description/debit/credit to the backend.
- **`useCategorization.js`** — session-scoped hook: calls the backend once per loaded statement, then layers manual overrides (Feature 3.5) and a **session-learned map** (Feature 3.8 — correcting one transaction's category is remembered by normalized description and auto-applied to any other transaction sharing that description, for the rest of the session) on top of the base rule/AI result. Also tracks the audit trail (Feature 3.7: `transactionId, description, originalCategory, updatedCategory, modifiedByUser, modifiedDate`) and computes the summary stats (Total/Auto/Review/Corrected).
- **`useTransactionRepository.js`** (Module 2) extended with a `reviewOnly` filter toggle so the Review Needed card can filter the table directly.
- **`TransactionTable.jsx`**: Category column is now an editable `Select` per row (Feature 3.5) with a confidence `Badge` shown next to anything flagged `needsReview`; row checkboxes + a bulk action bar ("N selected → [category] → Apply to selected", Feature 3.6); a "Needs review only" toggle button.
- **`AnalyserPage.jsx`**: runs categorization automatically right after Module 1 parsing, shows a "categorizing…" indicator, and renders the two summary cards (Review Needed — clickable, sets the review filter; Categorization Accuracy — Total/Auto/Review/Corrected) above the table.

### Explicitly out of scope (flagged, not built)
- Feature 3.9's recalculation list beyond category-level counts (monthly trends, financial health score, risk indicators, recommendations, forecasts) — no such analytics/insights module exists yet in this app; building those now would be fabricating data ahead of a module that defines what they should mean. The category-count recalculation that *does* exist (the accuracy summary) is fully live/real-time off React state.
- Audit trail and session-learned corrections are in-memory only and reset on reload or when a new statement is loaded, per the project's no-DB/session-only rule — same tradeoff as every other piece of state in this app.

## Verification

Backend, standalone (`curl` against `/api/categorize`):
- Clean merchant descriptions (Uber, Netflix, Salary, "Electronics Depot") all matched the rule engine at 100% confidence, no AI call made.
- Genuinely ambiguous descriptions ("Zenith Timepieces Purchase", "Harborline Consulting Invoice") correctly fell through to the AI path; with the mock key, the DeepSeek call fails and the fallback (`Other`/0%/`needsReview: true`) kicked in exactly as designed, with the real error visible in the backend log.

Full browser test (Playwright, temporarily installed/removed, both servers running):
- Loaded the 27-row sample statement: all 27 matched the rule engine (Total 27, Auto 27, Review 0).
- "Review Needed" card correctly filtered the table (0 rows, since nothing needed review on this clean sample).
- Manually changed one transaction's category via its dropdown → "Corrected" count went from 0 to 1, category persisted.
- Bulk-selected 2 rows, applied "Healthcare" via the bulk bar → both rows updated correctly, selection cleared.
- A separate ad hoc ambiguous-transactions CSV (2 unknown merchants + 1 salary) confirmed the AI-fallback path end-to-end in the actual UI: the 2 unknowns rendered as `Other` with a `0%` review badge, salary auto-categorized as `Income`, summary showed Total 3 / Auto 1 / Review 2 — matching the backend-only test.
- No console errors in any pass.
