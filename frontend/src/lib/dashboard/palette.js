// Validated categorical/status/sequential palette per the dataviz skill
// reference (references/palette.md) — both light and dark steps are the
// documented validated set, not an automatic flip of one set.
export const CATEGORICAL = {
  light: ['#2a78d6', '#008300', '#e87ba4', '#eda100', '#1baf7a', '#eb6834', '#4a3aa7', '#e34948'],
  dark: ['#3987e5', '#008300', '#d55181', '#c98500', '#199e70', '#d95926', '#9085e9', '#e66767'],
}

export const SEQUENTIAL_BLUE = { light: '#2a78d6', dark: '#3987e5' }

// Fixed, never reused for categorical series — always paired with an icon + label.
export const STATUS = {
  light: { good: '#0ca30c', warning: '#fab219', serious: '#ec835a', critical: '#d03b3b' },
  dark: { good: '#0ca30c', warning: '#fab219', serious: '#ec835a', critical: '#d03b3b' },
}

// Status colors are fixed/never themed (light and dark steps are
// identical per the palette reference), so non-chart UI can just use this
// directly without needing useChartPalette().
export const STATUS_COLORS = STATUS.light

export const CHART_CHROME = {
  light: { grid: '#e1e0d9', axis: '#c3c2b7', mutedText: '#898781' },
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
    categorical: CATEGORICAL[mode],
    sequentialBlue: SEQUENTIAL_BLUE[mode],
    status: STATUS[mode],
    chrome: CHART_CHROME[mode],
  }
}
