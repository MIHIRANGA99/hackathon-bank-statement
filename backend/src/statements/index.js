import { parseCsvTransactions } from './csvParser.js'
import { extractPdfText } from './pdfExtractor.js'
import { parsePdfRows } from './pdfRowParser.js'
import { ocrPdfText } from './ocr.js'
import { extractTransactionsWithAI } from './aiStatementParser.js'
import { normalizeTransactions } from './normalize.js'
import { validateFile } from './validation.js'
import { logger } from '../logger.js'

// A PDF with fewer than this many non-whitespace characters has no real
// selectable text layer — it's a scanned/photographed statement, so OCR
// runs instead of the (much faster) direct text extraction.
const MIN_TEXT_LAYER_CHARS = 40

async function parsePdf(buffer) {
  let text = await extractPdfText(buffer)

  if (text.replace(/\s+/g, '').length < MIN_TEXT_LAYER_CHARS) {
    logger.info('[Statements] No text layer found in PDF, falling back to OCR')
    text = await ocrPdfText(buffer)
  }

  // Deterministic regex parsing is the fast path — same hybrid
  // philosophy as categorization (rule engine first). The AI extractor
  // only runs as a last resort, for statement layouts the regex can't
  // recognize, keeping AI calls to the minority of unusual cases.
  const rows = parsePdfRows(text)
  if (rows.length > 0) return rows

  logger.info('[Statements] Deterministic PDF parsing found no rows, falling back to AI extraction')
  return extractTransactionsWithAI(text)
}

// Runs the full upload -> validate -> parse -> normalize pipeline for a
// multer file (in-memory buffer, never written to disk). CSV statements
// are already column-structured and parsed deterministically. PDF
// statements go: text extraction (or OCR if scanned) -> deterministic
// row parsing -> AI extraction only as a fallback. Throws with a
// user-facing message on any failure.
export async function processStatementUpload(file) {
  const ext = validateFile(file)

  const rawRows = ext === 'csv'
    ? parseCsvTransactions(file.buffer.toString('utf-8'))
    : await parsePdf(file.buffer)

  if (!rawRows || rawRows.length === 0) {
    throw new Error('This file appears to be empty.')
  }

  return normalizeTransactions(rawRows)
}
