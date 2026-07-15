import { StatementError, ERROR_MESSAGES } from './errors'
import { validateFileBasics, validateFileContent } from './validation'
import { parseCsvTransactions } from './csvParser'
import { extractPdfText, parsePdfTransactions } from './pdfParser'
import { normalizeTransactions } from './normalize'

export { StatementError }

function readAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new StatementError(ERROR_MESSAGES.UNREADABLE))
    reader.readAsArrayBuffer(file)
  })
}

// Runs the full upload -> validate -> parse -> normalize pipeline for a
// File (or File-like Blob with a .name), returning the final normalized
// transaction list. Throws StatementError with a user-facing message on
// any failure.
export async function processStatementFile(file) {
  const ext = validateFileBasics(file)

  const buffer = await readAsArrayBuffer(file)
  const bytes = new Uint8Array(buffer)
  validateFileContent(ext, bytes)

  let rawRows
  try {
    if (ext === 'csv') {
      const text = new TextDecoder('utf-8').decode(bytes)
      rawRows = parseCsvTransactions(text)
    } else {
      const text = await extractPdfText(buffer)
      rawRows = parsePdfTransactions(text)
    }
  } catch (err) {
    if (err instanceof StatementError) throw err
    throw new StatementError(ERROR_MESSAGES.UNREADABLE)
  }

  if (!rawRows || rawRows.length === 0) {
    throw new StatementError(ERROR_MESSAGES.EMPTY)
  }

  return normalizeTransactions(rawRows)
}
