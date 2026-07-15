# Requirement: Module 2 — Transaction Management

**Status:** Complete (100%)

## What was asked

Feature 2.1 — a transaction repository that temporarily maintains records for the active session, with retrieve/search/filter/sort capabilities. Feature 2.2 — a transaction listing showing Date, Description, Category, Debit, Credit, Balance, Reference Number, with search, sort, pagination, and filtering.

## What was done

- **Repository** (`frontend/src/lib/transactions/useTransactionRepository.js`): a hook, not a class/singleton — matches the project's "in-memory, session-scoped, React state only" rule. Takes the normalized transaction list from Module 1, stamps each row with an `id` and a `category` (defaults to `"Uncategorized"` since the categorisation module doesn't exist yet — see deviation below). Exposes:
  - **Retrieve**: `all`, `total`.
  - **Search**: `search`/`setSearch` — matches description, reference, and category (case-insensitive substring).
  - **Filter**: `categoryFilter`/`setCategoryFilter` (derived from categories actually present in the data) and `typeFilter`/`setTypeFilter` (debit-only / credit-only / all).
  - **Sort**: `sortField`/`sortDirection`/`toggleSort(field)` — click a column to sort ascending, click again to reverse. Numeric fields (debit/credit/balance) sort numerically with nulls treated as lowest; everything else sorts as case-insensitive text.
  - **Pagination**: `pageItems`, `page`/`setPage`, `pageSize`/`setPageSize`, `totalPages`, `resultCount`. Changing search/filter/page-size resets to page 1.
- **Listing UI** (`frontend/src/components/TransactionTable.jsx`): shadcn `Table`, `Input`, `Select`, `Badge`, `Button`. Search box; category and type `Select` filters; all sortable columns are clickable headers with an up/down/unsorted icon; category rendered as a `Badge`; pagination controls (rows-per-page select + Previous/Next + "Page X of Y"); a result-count readout ("N of M transactions"); an empty state when a search/filter combination matches nothing.
- Wired into `App.jsx` in place of the old raw `<table>` dump from Module 1.
- Added shadcn `input`, `select`, `table`, `badge` components via `npx shadcn add`.

## Verification

Browser-driven test (Playwright, temporarily installed/removed, same pattern as Module 1) against the 27-row sample statement:
- Pagination: 10 rows on page 1, "Page 1 of 3", advancing to "Page 2 of 3" via Next.
- Search: typing "Netflix" narrowed 27 rows to the 2 real Netflix transactions.
- Sort: clicking the Debit header twice (asc then desc) correctly surfaced the largest debit (400.00 — the "Transfer to J. Rivera - Savings") first.
- Filter: switching the type filter to "Credit only" correctly narrowed to the 2 salary payments only.
- Category badges render "Uncategorized" for all rows (expected — no categorisation module yet).
- No console errors.
- Fixed a cosmetic bug found during testing: the shadcn/base-ui `Select` was rendering the raw filter value ("all") instead of its label ("All categories"/"All types") in the collapsed trigger — fixed by passing a `children` render function to `SelectValue` that maps value → label.

## Deviations / notes

- **Category column** is a placeholder (`"Uncategorized"` for every row) — no categorisation engine exists yet. Per `CLAUDE.md`, categorisation must be a hybrid rule-engine + OpenAI-for-unmatched module; this note flags it as the next dependency for a "real" Category column, not something Module 2 was meant to implement.
- No persistence — repository state (search/filter/sort/page) resets whenever a new statement is loaded, consistent with the no-DB, session-only rule.
