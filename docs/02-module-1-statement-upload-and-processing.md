# Requirement: Module 1 — Statement Upload & Processing

**Status:** Complete (100%)

**Update:** the max upload size (Feature 1.2) was raised from 500KB to 2MB after initial delivery — 500KB was too restrictive for real-world statements. `MAX_FILE_SIZE_BYTES` in `frontend/src/lib/statements/validation.js`, the `TOO_LARGE` message in `errors.js`, and the upload card copy all updated accordingly.

## What was asked

Implement statement upload, validation, parsing (CSV + PDF), and normalization entirely in the frontend — no backend calls. Generate 3 sample statement files for testing/demo. Build: 1.1 Upload (drag-drop + browse + "try a sample"), 1.2 Validation (specific error messages for bad type/size/empty/corrupt/mismatched-content), 1.3 Parsing (CSV via papaparse, PDF via pdfjs-dist, tolerant of column/date-format variation), 1.4 Normalization (ISO dates, plain numeric amounts, cleaned descriptions, placeholder references). Result stored in React state only.

## What was done

- **Sample data** (`frontend/public/sample-data/`): generated programmatically (script run once, then discarded) so running balances are internally consistent.
  - `sample-statement-1.csv` — 27 transactions, Jan–Feb 2026, YYYY-MM-DD dates, full column set incl. reference.
  - `sample-statement-2.pdf` — 20 transactions, Jan–Feb 2026, DD/MM/YYYY dates, real PDF (built with a temporary `pdf-lib` dev install, removed after use) laid out as `Date | Description | Amount | Balance` — no reference column, to exercise placeholder-reference generation.
  - `sample-statement-3-edge-cases.csv` — 3 transactions, March 2026 only, one transaction overdraws the balance (goes negative), one row has a blank reference.
- **Validation** (`src/lib/statements/validation.js`): extension check (csv/pdf only), 0-byte check, ≥500KB check, and a byte-level content sniff — PDF must start with `%PDF`, CSV is rejected if a sample of its bytes looks binary (catches a renamed/mismatched file). Each failure throws a `StatementError` carrying the exact user-facing message from the spec.
- **CSV parsing** (`src/lib/statements/csvParser.js`): papaparse with a column-alias map (e.g. `narrative`/`details`/`particulars` → `description`) tolerant of naming/order variation; drops fully blank rows.
- **PDF parsing** (`src/lib/statements/pdfParser.js`): extracts text via pdfjs-dist, then a line regex matching `DATE  DESCRIPTION  AMOUNT  BALANCE` (signed amount → debit/credit), tolerating both date formats.
  - **Gotcha found during testing:** pdf.js splits each visual line into several text items (one per run of text/whitespace) rather than one item per line. Fixed by concatenating items and only breaking on `item.hasEOL` (a flag pdf.js sets on the last item of each line) instead of assuming one item = one line.
- **Normalization** (`src/lib/statements/normalize.js`): dates → ISO; amounts → plain numbers (strips symbols/commas, handles `-x` and `(x)` negative forms); descriptions trimmed/whitespace-collapsed, and only re-cased when the source is all-caps or all-lowercase (so mixed-case text with acronyms like "ATM" isn't mangled); missing references get `REF-{n}`.
- **Orchestration** (`src/lib/statements/index.js`): `processStatementFile(file)` runs validate → read → parse → normalize and is the only entry point the UI calls.
- **UI** (`src/components/StatementUpload.jsx`, wired into `src/App.jsx`): drag-and-drop card + hidden file input triggered by a "Browse files" button, a "Try a sample statement instead" link that fetches `sample-statement-1.csv` and runs it through the same pipeline, a processing indicator, and a shadcn `Alert` for errors. A transaction table renders the normalized result for verification.

## Verification

- **Unit-level** (temporary Node scripts, removed after use): parsed and normalized all 3 sample files — correct row counts (27 / 20 / 3), ISO dates, correct overdrawn balance (-250.00) on statement 3, and `REF-n` placeholders generated for the PDF (no source reference column) and for the one blank-reference CSV row.
- **Validation edge cases** (temporary Node script, removed after use): renamed `.txt` file → "Invalid file type…"; ≥500KB file → "File too large…"; 0-byte file → "This file appears to be empty."; byte-mismatched content for both `.csv` and `.pdf` extensions → "Unable to process this statement…". All passed.
- **Full browser test** (Playwright, temporarily installed and removed after use, no project run-skill existed yet so this was ad hoc): started the Vite dev server, then in a real Chromium instance — loaded the sample statement (27 rows rendered), uploaded `sample-statement-2.pdf` (20 rows, ISO dates, REF-n), uploaded the edge-case CSV (3 rows, negative balance visible), uploaded a renamed `.txt` file (correct error text shown), uploaded an oversized CSV (correct error text shown). No console errors. Screenshots confirmed the UI visually. Dev server stopped afterward.

## Deviations / notes

- No project-level run skill existed for this repo yet, so browser verification was done ad hoc with Playwright rather than a documented reusable script. Worth generating a `run` skill later if UI testing becomes routine.
- `pdf-lib` (sample generation) and `playwright` (browser testing) were both installed with `--no-save`/uninstalled afterward — neither is a runtime dependency of the app.
