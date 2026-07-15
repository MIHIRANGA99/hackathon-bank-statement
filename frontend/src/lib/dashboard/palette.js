// Validated categorical/status palette (see dataviz skill reference).
// Categorical order is fixed — never reassign/cycle these per re-render.
export const CATEGORICAL = [
  '#2a78d6', // blue
  '#008300', // green
  '#e87ba4', // magenta
  '#eda100', // yellow
  '#1baf7a', // aqua
  '#eb6834', // orange
  '#4a3aa7', // violet
  '#e34948', // red
]

export const SEQUENTIAL_BLUE = '#2a78d6'

// Fixed, never reused for categorical series — always paired with an icon + label.
export const STATUS = {
  good: '#0ca30c',
  warning: '#fab219',
  serious: '#ec835a',
  critical: '#d03b3b',
}

export const CHART_CHROME = {
  grid: '#e1e0d9',
  axis: '#c3c2b7',
  mutedText: '#898781',
}
