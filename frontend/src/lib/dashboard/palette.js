// Validated categorical/status/sequential palette per the dataviz skill
// reference (references/palette.md).
//
// These flat exports are the original light-mode values — kept exactly as
// they were so existing consumers (e.g. CashflowPage) that import them
// directly as plain colors keep working unchanged.
export const CATEGORICAL = ['#2a78d6', '#008300', '#e87ba4', '#eda100', '#1baf7a', '#eb6834', '#4a3aa7', '#e34948']
export const SEQUENTIAL_BLUE = '#2a78d6'
export const STATUS = { good: '#0ca30c', warning: '#fab219', serious: '#ec835a', critical: '#d03b3b' }
export const CHART_CHROME = { grid: '#e1e0d9', axis: '#c3c2b7', mutedText: '#898781' }

// Status colors are fixed/never themed (light and dark steps are
// identical per the palette reference) — same values as STATUS above,
// exported under this name too for callers that prefer it.
export const STATUS_COLORS = STATUS

// Theme-aware variants (dark steps are the palette reference's own
// validated dark set, not an automatic flip) — used via useChartPalette()
// by components that need to react to the light/dark toggle.
const CATEGORICAL_THEMES = {
  light: CATEGORICAL,
  dark: ['#3987e5', '#008300', '#d55181', '#c98500', '#199e70', '#d95926', '#9085e9', '#e66767'],
}
const SEQUENTIAL_BLUE_THEMES = { light: SEQUENTIAL_BLUE, dark: '#3987e5' }
const STATUS_THEMES = { light: STATUS, dark: STATUS }
const CHART_CHROME_THEMES = {
  light: CHART_CHROME,
  dark: { grid: '#2c2c2a', axis: '#383835', mutedText: '#898781' },
}

// Uses CSS custom properties so the tooltip box itself tracks the current
// theme automatically (no JS branching needed — these vars already flip
// under the .dark class).
export const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: 'var(--popover)',
    border: '1px solid var(--border)',
    borderRadius: '0.75rem',
    color: 'var(--popover-foreground)',
    fontSize: '0.8rem',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  },
  labelStyle: { color: 'var(--muted-foreground)' },
  itemStyle: { color: 'var(--popover-foreground)' },
}

export function pickPalette(theme) {
  const mode = theme === 'dark' ? 'dark' : 'light'
  return {
    categorical: CATEGORICAL_THEMES[mode],
    sequentialBlue: SEQUENTIAL_BLUE_THEMES[mode],
    status: STATUS_THEMES[mode],
    chrome: CHART_CHROME_THEMES[mode],
  }
}
