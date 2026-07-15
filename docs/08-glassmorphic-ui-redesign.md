# Requirement: Full UI Redesign — Glassmorphic, Dark/Light Mode

**Status:** Complete (100%)

## What was asked

Redesign the full UI across the app following modern UI principles: a glassmorphic look, full light/dark mode support, user-friendly, without breaking any existing functionality.

## Context

By the time this started, the app had grown beyond my own work — a teammate had merged a Financial Assistant chatbot feature (`frontend/src/components/Chatbot/`) via its own branch/PR on the shared GitHub repo. This redesign treats that as existing functionality to preserve and restyle lightly, not something to rebuild. Given the repo is now genuinely collaborative (multiple branches, PRs), this work was done on a new local branch (`ui-redesign`) rather than directly on `main`.

## What was done

### Theming system
- **`frontend/src/lib/theme/ThemeProvider.jsx`** — a small context (`useTheme()`) that toggles a `.dark` class on `<html>`, persists the choice to `localStorage`, and defaults to the OS's `prefers-color-scheme` when nothing's stored yet.
- **`index.html`** — an inline pre-hydration script sets the `.dark` class before React mounts, so there's no flash of the wrong theme on load.
- **`ThemeToggle.jsx`** — sun/moon icon button, wired into the new shared header.

### Design tokens (`frontend/src/index.css`)
- Added `--brand-from`/`--brand-to` (a violet→sky-blue gradient pair, light and dark variants) and `--glass-bg`/`--glass-border`/`--glass-shadow` tokens on top of the existing shadcn Nova theme (left untouched, so all existing semantic tokens — `bg-background`, `text-foreground`, etc. — still work exactly as before).
- New utility classes: `.glass-panel` (translucent background + backdrop blur + subtle border/shadow — the core glassmorphic surface), `.brand-gradient-bg` / `.brand-gradient-text`, and `.app-backdrop` (a fixed, blurred two-blob gradient mesh rendered once behind the whole app).

### Shared primitives
- **`components/ui/card.jsx`** now applies `.glass-panel` by default — since nearly every surface in the app (stat cards, chart cards, the transaction table, the upload dropzone) is built on `<Card>`, this one change cascades the new look everywhere with minimal per-page edits.
- **`alert.jsx`** — radius/shadow tweaked to match; kept solid (non-translucent) since error alerts should stay maximally legible.
- Button/Input/Select/Table/Tabs/Progress were left alone — they already used shadcn's semantic CSS-variable tokens, so they adapt to dark mode automatically once `.dark` toggles; no risk in touching them further.

### Shared layout
- **`AppBackground.jsx`** — the decorative gradient mesh, mounted once in `App.jsx` (alongside the existing `<Chatbot />`, not replacing it).
- **`AppHeader.jsx`** — a new sticky glass nav bar (logo, Dashboard/Analyser links, theme toggle), added to `AnalyserPage` and `DashboardPage`, replacing the old ad hoc "Back to dashboard" / "Go to Analyser" buttons with consistent navigation everywhere.

### Pages & components restyled
- **`WelcomePage`** — a proper glass splash card with a gradient logo mark and an animated loading bar, instead of plain centered text.
- **`DashboardPage`** — wrapped in `AppHeader`; loading/empty/error states now share a `CenteredState` glass-card treatment instead of bare text.
- **`AnalyserPage`** — wrapped in `AppHeader`; gradient-accented heading.
- **`StatementUpload.jsx`** — the dropzone now shows a gradient-filled icon badge and a gradient border treatment while actively dragging a file over it.
- **`TransactionTable.jsx`** — wrapped in a glass panel; bulk-action bar and table border restyled to match; checkboxes tinted with the brand color.
- **All 8 dashboard cards** — colors now come from a theme-aware palette (see below) instead of static light-only hex values.
- **`Chatbot/ChatWindow.jsx`** — restyled the floating window to `.glass-panel` (was a solid `bg-background`); no changes to `useChat.js`, `MessageArea.jsx`, or `InputArea.jsx` (chat logic untouched).

### Theme-aware charts (dataviz skill)
The dashboard's Recharts colors were previously static, light-mode-only hex values (from the Module 4 build). Per the dataviz skill's rule that dark mode must be *selected* — its own validated steps, not an automatic flip — `frontend/src/lib/dashboard/palette.js` now exports both light and dark variants (the exact validated dark steps from the skill's reference palette) plus a `useChartPalette()` hook that picks the right set from the live theme. All 6 chart-bearing cards were updated to call this hook instead of importing static constants. Chart tooltips use CSS custom properties (`var(--popover)` etc.) so they track the theme automatically without needing JS branching.

## Deviations / notes

- Status colors (good/warning/serious/critical) are documented as fixed/never-themed in the palette reference — light and dark steps are identical — so non-chart UI (health score, spending-behavior deltas, alert cards) uses a flat `STATUS_COLORS` export rather than going through the theme-aware hook, since there's nothing to switch.
- Removed the old redundant per-page "Back to dashboard" / "Go to Analyser" buttons in favor of the persistent header nav — same navigation capability, less duplication.

## Verification

Full browser regression pass (Playwright, temporarily installed/removed) covering the actual risk of a redesign this size — that something functional broke:
- Welcome page renders, auto-redirects to Dashboard.
- Dark mode toggle flips the `.dark` class immediately and **persists across a full page reload** (localStorage working).
- Analyser page: sample statement upload → parse → categorize still works in dark mode; manually changing a transaction's category via its dropdown still updates correctly (Module 3 functionality intact).
- Dashboard: all 8 cards render with correct data in both themes, charts and tooltips legible in dark mode.
- Chatbot: floating button still opens/closes the (now glass-styled) window.
- Zero console errors in the final pass.

**Bug found and fixed during this pass** (not a redesign regression, pre-existing): a React "duplicate key" warning in `SignificantTransactionsCard` — its list key was `description-date`, which collides when the accumulated MongoDB history contains more than one transaction with the same description and date (an artifact of repeatedly uploading the same sample statement across testing sessions). Fixed by adding the array index to the key. Worth knowing this reflects real duplicate data accumulating in the shared database from repeated test uploads — not something this redesign needed to solve, but flagging it since it's visible now.
