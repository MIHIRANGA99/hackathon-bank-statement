# Requirement: Frontend Routing (Welcome → Dashboard → Analyser)

**Status:** Complete (100%)

## What was asked

Add routes: the main/root page is a Welcome page that auto-redirects to a Dashboard page after a few seconds; the Dashboard has a button to navigate to the Account Statement Analyser.

## What was done

- Installed `react-router-dom`.
- `frontend/src/main.jsx` now wraps `<App />` in `<BrowserRouter>`.
- `frontend/src/App.jsx` replaced its previous page content with `<Routes>`:
  - `/` → `WelcomePage`
  - `/dashboard` → `DashboardPage`
  - `/analyser` → `AnalyserPage`
  - `*` (unknown paths) → redirect to `/`
- **`src/pages/WelcomePage.jsx`**: shows a "Welcome" heading, auto-navigates to `/dashboard` after 2.5s via `setTimeout` + `useNavigate` (cleaned up on unmount).
- **`src/pages/DashboardPage.jsx`**: placeholder dashboard heading + a button ("Go to Account Statement Analyser") that navigates to `/analyser`.
- **`src/pages/AnalyserPage.jsx`**: the existing upload + transaction table UI (previously the entire contents of `App.jsx`) moved here as-is, with a "Back to dashboard" link added at the top.
- Buttons that navigate use shadcn's `Button` with base-ui's `render={<Link to="..." />}` pattern (this UI kit's equivalent of Radix's `asChild`), with `nativeButton={false}` — needed because base-ui's `Button` defaults to expecting a native `<button>` and otherwise logs a console warning when rendering an `<a>` (via `Link`) instead.

## Verification

Browser-driven test (Playwright, temporarily installed/removed):
- `/` shows "Welcome" and auto-redirects to `/dashboard` within the expected window.
- Dashboard's button navigates to `/analyser`, which renders the Account Statement Analyser UI correctly (upload + table still functional from Module 1/2).
- "Back to dashboard" link returns to `/dashboard`.
- An unknown route (`/some/unknown/route`) redirects to `/`, which itself then auto-redirects to `/dashboard`.
- No console errors after adding `nativeButton={false}` (a warning was present before that fix — caught during this same verification pass).

## Deviations / notes

- None — matches the ask directly. Redirect delay set to 2.5s ("within a few seconds").
