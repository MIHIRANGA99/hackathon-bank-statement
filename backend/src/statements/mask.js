// Masks long digit runs (account/card numbers) down to their last 4
// digits. Run before any statement text is sent to DeepSeek — dates and
// amounts use separators (/, ., ,) that break up the run, so they never
// match the 8-digit threshold.
export function maskAccountNumbers(text) {
  return text.replace(/\b(\d[\d -]{7,}\d)\b/g, (match) => {
    const digits = match.replace(/[^0-9]/g, '')
    if (digits.length < 8) return match
    return `****${digits.slice(-4)}`
  })
}
