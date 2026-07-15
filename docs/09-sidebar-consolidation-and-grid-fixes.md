# Requirement: Sidebar Consolidation + Dashboard Grid Fixes

**Status:** Complete (100%)

## What was asked

After the glassmorphic redesign, a teammate's concurrently-merged work added a sidebar layout (`DashboardLayout`) and a new "Money Movement" cashflow page — resulting in **both** my per-page top header and the new sidebar rendering at once. Asked to: keep the sidebar (remove the duplicate top bar), give it a nice/consistent UI, and fix visibly "ugly" empty spacing in the Dashboard's card grid.

## What was found

- `git log` showed the `ui-redesign` branch had been merged with `main`, which brought in a `cashflow-analysis` branch (a full "Money Movement" page: `CashflowPage.jsx` + `DashboardLayout.jsx` sidebar) built independently while I was working.
- Two real bugs from that merge, not just styling:
  1. **`AnalyserPage`/`DashboardPage` still rendered my `AppHeader`** on top of the new `DashboardLayout` sidebar — the literal duplicate-nav-bar problem reported.
  2. **`CashflowPage.jsx` imports `CATEGORICAL`, `SEQUENTIAL_BLUE`, `STATUS`, `CHART_CHROME` from `palette.js` as plain color values** (e.g. `stroke={SEQUENTIAL_BLUE}`), but my Module 4 dark-mode work had changed those same names to `{light, dark}` objects. This would have silently broken every color on the Cashflow page (a string like `"[object Object]"` isn't a valid CSS color) — caught and fixed before it caused any visible damage, but worth flagging since it's the kind of conflict that happens with concurrent edits to shared files.

## What was done

- **`frontend/src/lib/dashboard/palette.js`**: restored the original flat exports (`CATEGORICAL`, `SEQUENTIAL_BLUE`, `STATUS`, `CHART_CHROME` as plain arrays/strings/objects) exactly as `CashflowPage` expects them, unchanged. The theme-aware light/dark variants now live under different internal names, exposed only via `pickPalette()`/`useChartPalette()` for the Module 4 dashboard cards that need them. Both APIs coexist — nothing else had to change.
- **`DashboardLayout.jsx`** (the sidebar, built by a teammate) restyled to match the glass design system: `.glass-panel` sidebar and mobile header, brand mark consistent with the rest of the app ("Statement Analyser" + the gradient wallet icon, replacing the placeholder "FinAnalytica" text-only brand), active nav item using the brand gradient instead of a flat `bg-primary`, and the `ThemeToggle` moved into the sidebar footer (desktop) / mobile header (small screens) — one theme toggle, not two.
- **Removed the duplicate header**: deleted `AppHeader.jsx` entirely (fully unused now) and stripped the `min-h-svh` page-shell wrappers from `DashboardPage.jsx`/`AnalyserPage.jsx`, since `DashboardLayout`'s `<main>` already provides that shell. Pages now just render their content.
- **Fixed the "ugly spaces" in the dashboard grid** — two distinct causes:
  1. CSS Grid's default `align-items: stretch` was forcing every card to match the tallest card in its row (e.g. the short Financial Health Score card was stretching to match the much taller Income Overview card, leaving a large dead area inside it). Fixed with one class: `items-start` on the grid container.
  2. The Income/Savings line charts' Y-axis had no explicit domain, so Recharts defaulted to starting at 0 — with income values in the thousands, the actual data occupied only the top sliver of the chart, leaving a large empty gap below. Fixed by giving both charts a padded domain based on their actual min/max (`min * 0.85` to `max * 1.15`) instead of an implicit 0 baseline.

## Verification

Full browser regression pass (Playwright, temporarily installed/removed):
- Dashboard: exactly one sidebar, no visible duplicate header, Financial Health card no longer stretched, no console errors.
- Sidebar navigation between Dashboard / Statement Analyser / Money Movement all work.
- Cashflow page renders correctly with working colors (confirming the palette fix) — and, since it's built on the same global `Card` component, already inherits the glass look without any changes to its own code.
- Dark mode toggle from the sidebar works on every page; no duplicate toggle.
- Screenshots confirm the grid gap issue is resolved.
