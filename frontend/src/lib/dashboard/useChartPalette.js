import { useTheme } from '@/lib/theme/ThemeProvider'
import { pickPalette } from './palette'

// Chart colors must be *selected* per theme (own validated steps), not an
// automatic light->dark flip — see the dataviz skill's palette reference.
export function useChartPalette() {
  const { theme } = useTheme()
  return pickPalette(theme)
}
