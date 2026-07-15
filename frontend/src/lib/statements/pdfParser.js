import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { StatementError, ERROR_MESSAGES } from './errors'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl

// One transaction per line: DATE  DESCRIPTION  AMOUNT  BALANCE
// Amount is signed (negative = debit, positive = credit).
const LINE_RE =
  /^(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})\s+(.+?)\s+(-?[\d,]+\.\d{2})\s+(-?[\d,]+\.\d{2})\s*$/

export async function extractPdfText(arrayBuffer) {
  let pdf
  try {
    pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  } catch {
    throw new StatementError(ERROR_MESSAGES.UNREADABLE)
  }

  let fullText = ''
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()

    // pdf.js splits each visual line into multiple items (e.g. one per
    // run of text/whitespace); each item flags hasEOL when it's the last
    // one on its line, so we concatenate runs and break on that flag.
    let line = ''
    for (const item of textContent.items) {
      line += item.str
      if (item.hasEOL) {
        fullText += line + '\n'
        line = ''
      }
    }
    if (line) fullText += line + '\n'
  }
  return fullText
}

// Parses extracted PDF text into loosely-shaped transaction rows.
export function parsePdfTransactions(text) {
  const rows = []
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim().replace(/\s+/g, ' ')
    const match = line.match(LINE_RE)
    if (!match) continue

    const [, date, description, amountStr, balanceStr] = match
    const amount = parseFloat(amountStr.replace(/,/g, ''))
    const balance = parseFloat(balanceStr.replace(/,/g, ''))

    rows.push({
      date,
      description: description.trim(),
      debit: amount < 0 ? Math.abs(amount) : '',
      credit: amount >= 0 ? amount : '',
      balance,
      reference: '',
    })
  }
  return rows
}
