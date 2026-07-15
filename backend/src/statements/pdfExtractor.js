import { PDFParse } from 'pdf-parse'

// Extracts the full concatenated text from a PDF buffer. The result is
// unstructured — actual transaction rows are pulled out by the AI parser.
export async function extractPdfText(buffer) {
  const parser = new PDFParse({ data: buffer })
  try {
    const result = await parser.getText()
    return result.text
  } finally {
    await parser.destroy()
  }
}
