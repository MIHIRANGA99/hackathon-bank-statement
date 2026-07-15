import { StatementError, ERROR_MESSAGES } from './errors'
import { validateFileBasics, validateFileContent } from './validation'

export { StatementError }

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

function readAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new StatementError(ERROR_MESSAGES.UNREADABLE))
    reader.readAsArrayBuffer(file)
  })
}

// Validates the file client-side for instant feedback, then uploads it to
// the backend, which extracts and (for PDFs) AI-parses the transactions
// in memory — the raw file and parsed data are never written to disk.
export async function processStatementFile(file) {
  const ext = validateFileBasics(file)

  const buffer = await readAsArrayBuffer(file)
  const bytes = new Uint8Array(buffer)
  validateFileContent(ext, bytes)

  const formData = new FormData()
  formData.append('statement', file)

  let res
  try {
    res = await fetch(`${API_BASE_URL}/api/statements/parse`, {
      method: 'POST',
      body: formData,
    })
  } catch {
    throw new StatementError(ERROR_MESSAGES.UNREADABLE)
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new StatementError(data.error || ERROR_MESSAGES.UNREADABLE)
  }
  if (!data.transactions || data.transactions.length === 0) {
    throw new StatementError(ERROR_MESSAGES.EMPTY)
  }

  return data.transactions
}
