export const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024

// Validates a multer file object (extension, size, and — for PDFs — the
// magic header) before it's parsed. Throws a user-facing message on
// failure.
export function validateFile(file) {
  const ext = (file.originalname || '').split('.').pop()?.toLowerCase()

  if (ext !== 'csv' && ext !== 'pdf') {
    throw new Error('Invalid file type. Please upload a PDF or CSV bank statement.')
  }
  if (!file.buffer || file.buffer.length === 0) {
    throw new Error('This file appears to be empty.')
  }
  if (file.size >= MAX_FILE_SIZE_BYTES) {
    throw new Error('File too large. Please upload a statement under 2MB.')
  }
  if (ext === 'pdf' && file.buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
    throw new Error('Unable to process this statement. Please check the file and try again.')
  }

  return ext
}
