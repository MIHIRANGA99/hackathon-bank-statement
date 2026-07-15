# Requirement: Module 4 — Financial Insights Dashboard

**Status:** UI complete against mock data (100% of this pass's scope); real computation deferred

## What was asked

The Financial Analytics Engine (Income/Expense/Savings/Category/Largest-Transactions/Recurring-Payments/Anomaly analysis), presented as a user-facing "Financial Insights Dashboard" — not a list of technical calculations — with the specific card layout and user-facing naming given in the spec. Mid-conversation, the direction changed: **a MongoDB-backed backend is planned for a future module**; for now, build the dashboard UI against a **mock `/api/dashboard` backend call** rather than wiring real computation from uploaded statement data.

## What was done

### Backend
- **`backend/src/dashboard/mockData.js`** — a hardcoded fixture object shaped exactly like what a future MongoDB aggregation should return: `healthScore`, `income` (total/average/growth/trend), `expenses` (total + category breakdown), `savings` (amount/rate/trend), `spendingBehavior` (month-over-month per category), `significantTransactions` (highest expenses / largest credits), `recurringPayments` (list + monthly total), `alerts` (spending-spike and unusual-transaction examples).
- **`GET /api/dashboard`** in `backend/index.js` returns this fixture directly. Commented in code as mock-for-now, to be replaced by a real query once MongoDB is introduced — **this response shape is the contract the frontend is already built against**, so swapping the mock for a real aggregation later shouldn't require frontend changes as long as the shape is preserved.

### Frontend
- **`frontend/src/lib/dashboard/api.js`** — `fetchDashboard()`, a plain GET against the backend.
- **`frontend/src/lib/dashboard/palette.js`** — the categorical/status/sequential colors from the project's dataviz skill reference palette, validated (see below) rather than picked by eye.
- **8 card components** in `frontend/src/components/dashboard/`, one per spec section, using the spec's user-facing names (never "Income Analysis" / "Expense Distribution" etc. in the UI):
  - `FinancialHealthCard` — score/100, color-coded by band (green ≥80 down to red <40).
  - `IncomeOverviewCard` — Recharts line chart (single-hue blue, per the "sequential = one hue" rule for magnitude-over-time) + total/average/growth stats.
  - `SpendingOverviewCard` — donut chart (validated 5-color categorical palette) + a ranked category list beside it (the list also satisfies the palette's "relief rule" — 3 of the 5 slots are sub-3:1 contrast on their own, so direct labels are mandatory, not optional).
  - `SavingsProgressCard` — a `Progress` bar rate indicator + trend line.
  - `SpendingBehaviorCard` — this-month-vs-last-month per category with ↑/↓ and a "Higher than usual" flag badge.
  - `SignificantTransactionsCard` — `Tabs` for Highest Expenses / Largest Credits.
  - `RecurringPaymentsCard` — list + total monthly commitment.
  - `SmartSpendingAlertsCard` — the most visually prominent card per the spec, amber-bordered alert boxes with an icon, before/after numbers, and a suggestion line.
- **`DashboardPage.jsx`** rewritten to fetch from `/api/dashboard` on mount (loading/error states included) and lay out all 8 cards in the spec's recommended order.
- Added **Recharts** (line + pie/donut) and shadcn's **`Tabs`**/**`Progress`** components.

### Dataviz skill compliance
- Ran `validate_palette.js` against the 5-category donut palette before using it — passed all hard checks (lightness band, chroma floor, CVD separation ΔE 9.1, normal-vision ΔE 19.6) with one contrast WARN (3 of 5 slots sub-3:1 vs the light surface), which the design addresses per the skill's "relief rule": the category list next to the donut always shows the category name in plain text, not color-dependent.
- Sequential (single-hue blue) used for both line charts, not a rainbow/multi-hue line.
- Status colors (amber for alerts) kept separate from the categorical palette and always paired with an icon + text label, never color alone.

## Deviations from the original spec (explicitly flagged, as directed)

- **No real computation yet.** Everything in Feature 4.1–4.7 (income/expense/savings math, category ranking, largest transactions, recurring-payment detection, anomaly detection) is **fixture data**, not derived from the transactions a user actually uploads in Module 1–3. The dashboard currently shows the same numbers regardless of what statement was analysed. This was an explicit, intentional simplification for this pass, ahead of the planned MongoDB-backed backend.
- The architecture question from the prior planning turn (lift transaction state into a shared context so `/dashboard` could read real session data) was **not needed** for this pass, since the dashboard now gets its data from the backend instead of from in-session frontend state. That question will resurface once real computation replaces the mock: the backend will need the actual transactions (masked) sent to it to store/aggregate, which is a bigger architectural shift than Module 1–3's "everything stays in the browser" model — worth a deliberate decision when that work starts, not assumed here.
- No Financial Health Score formula, recurring-payment heuristic, or anomaly-detection threshold was implemented (since there's no real computation yet) — the previous plan's proposed defaults for those remain proposals for whenever real computation is built, not implemented code today.

## Verification

- Backend: `curl http://localhost:4000/api/dashboard` returns the full fixture with all 8 top-level keys.
- Browser (Playwright, temporarily installed/removed): navigated to `/dashboard`, confirmed the health score, income chart, donut + ranked categories, savings progress bar + trend, spending behavior deltas, recurring payments list + total, and both spending alerts all render with real (mock) numbers; switched the Significant Transactions tab from Highest Expenses to Largest Credits and confirmed the content changed; no console errors. Screenshot confirmed the layout visually matches the spec's recommended structure.
