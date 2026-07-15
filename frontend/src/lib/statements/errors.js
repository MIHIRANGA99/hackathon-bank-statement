export class StatementError extends Error {
  constructor(message) {
    super(message)
    this.name = 'StatementError'
  }
}

export const ERROR_MESSAGES = {
  INVALID_TYPE: 'Invalid file type. Please upload a PDF or CSV bank statement.',
  TOO_LARGE: 'File too large. Please upload a statement under 2MB.',
  EMPTY: 'This file appears to be empty.',
  UNREADABLE: 'Unable to process this statement. Please check the file and try again.',
}
