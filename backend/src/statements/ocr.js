import { PDFParse } from 'pdf-parse'
import { createWorker } from 'tesseract.js'
import { logger } from '../logger.js'

// Rasterizes each PDF page and OCRs it. Only used when the PDF has no
// selectable text layer (a scanned/photographed statement) — text-based
// PDFs go through the much faster extractPdfText() instead.
export async function ocrPdfText(buffer) {
  const parser = new PDFParse({ data: buffer })
  let screenshots
  try {
    screenshots = await parser.getScreenshot({ imageBuffer: true, scale: 2 })
  } finally {
    await parser.destroy()
  }

  logger.info(`[OCR] Rasterized ${screenshots.pages.length} page(s), running OCR`)

  const worker = await createWorker('eng')
  try {
    let fullText = ''
    for (const page of screenshots.pages) {
      const { data } = await worker.recognize(Buffer.from(page.data))
      fullText += data.text + '\n'
    }
    return fullText
  } finally {
    await worker.terminate()
  }
}
