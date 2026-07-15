import { StatementError, ERROR_MESSAGES } from './errors'

export const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024

export function validateFileBasics(file) {
  const ext = (file.name || '').split('.').pop()?.toLowerCase()

  if (ext !== 'csv' && ext !== 'pdf') {
    throw new StatementError(ERROR_MESSAGES.INVALID_TYPE)
  }
  if (file.size === 0) {
    throw new StatementError(ERROR_MESSAGES.EMPTY)
  }
  if (file.size >= MAX_FILE_SIZE_BYTES) {
    throw new StatementError(ERROR_MESSAGES.TOO_LARGE)
  }

  return ext
}

// Sniffs the actual bytes to catch a renamed/mismatched file (e.g. a .csv
// that is really a binary file, or a .pdf missing the PDF magic header).
export function validateFileContent(ext, bytes) {
  if (ext === 'pdf') {
    const header = String.fromCharCode(...bytes.slice(0, 5))
    if (!header.startsWith('%PDF')) {
      throw new StatementError(ERROR_MESSAGES.UNREADABLE)
    }
    return
  }

  // csv: sniff for binary content in the first chunk of bytes
  const sampleLen = Math.min(bytes.length, 1000)
  let nonPrintable = 0
  for (let i = 0; i < sampleLen; i++) {
    const b = bytes[i]
    if (b === 0) {
      nonPrintable = sampleLen
      break
    }
    if (b < 9 || (b > 13 && b < 32)) nonPrintable++
  }
  if (nonPrintable / sampleLen > 0.05) {
    throw new StatementError(ERROR_MESSAGES.UNREADABLE)
  }
}
