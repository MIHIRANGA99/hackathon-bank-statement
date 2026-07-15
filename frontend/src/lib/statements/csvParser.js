import Papa from 'papaparse'
import { StatementError, ERROR_MESSAGES } from './errors'

const COLUMN_ALIASES = {
  date: ['date', 'transaction date', 'txn date', 'value date'],
  description: ['description', 'details', 'narrative', 'particulars', 'transaction details', 'memo'],
  debit: ['debit', 'debit amount', 'withdrawal', 'withdrawals', 'money out', 'amount out'],
  credit: ['credit', 'credit amount', 'deposit', 'deposits', 'money in', 'amount in'],
  balance: ['balance', 'running balance', 'closing balance'],
  reference: ['reference', 'ref', 'reference no', 'ref no', 'transaction id', 'txn id'],
}

function normalizeHeader(header) {
  return (header || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

function buildColumnMap(headers) {
  const normalized = headers.map(normalizeHeader)
  const map = {}
  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    const idx = normalized.findIndex((h) => aliases.includes(h))
    if (idx !== -1) map[field] = headers[idx]
  }
  return map
}

// Parses raw CSV text into loosely-shaped transaction rows (still in
// source format — normalization happens in a separate step).
export function parseCsvTransactions(text) {
  let result
  try {
    result = Papa.parse(text, { header: true, skipEmptyLines: true })
  } catch {
    throw new StatementError(ERROR_MESSAGES.UNREADABLE)
  }

  const headers = result.meta?.fields || []
  if (headers.length === 0) {
    throw new StatementError(ERROR_MESSAGES.UNREADABLE)
  }

  const colMap = buildColumnMap(headers)
  if (!colMap.date || !colMap.description) {
    throw new StatementError(ERROR_MESSAGES.UNREADABLE)
  }

  const rows = (result.data || [])
    .map((row) => ({
      date: row[colMap.date] ?? '',
      description: row[colMap.description] ?? '',
      debit: colMap.debit ? row[colMap.debit] ?? '' : '',
      credit: colMap.credit ? row[colMap.credit] ?? '' : '',
      balance: colMap.balance ? row[colMap.balance] ?? '' : '',
      reference: colMap.reference ? row[colMap.reference] ?? '' : '',
    }))
    .filter((row) => String(row.date).trim() || String(row.description).trim())

  return rows
}
