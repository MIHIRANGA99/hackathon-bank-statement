import mongoose from 'mongoose'

const { Schema, model } = mongoose

const statementSchema = new Schema({
  sourceFileName: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  transactionCount: { type: Number, required: true },
})

const transactionSchema = new Schema({
  statementId: { type: Schema.Types.ObjectId, ref: 'Statement', required: true },
  date: { type: String, required: true }, // ISO YYYY-MM-DD, per Module 1 normalization
  description: { type: String, required: true },
  debit: { type: Number, default: null },
  credit: { type: Number, default: null },
  balance: { type: Number, default: null },
  reference: { type: String },
  category: { type: String, required: true },
  confidence: { type: Number, required: true },
  source: { type: String, required: true }, // rule | ai | ai-error | user | learned
  needsReview: { type: Boolean, default: false },
  categorizedAt: { type: Date, default: Date.now },
})

const auditLogSchema = new Schema({
  transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction', required: true },
  originalCategory: { type: String, required: true },
  updatedCategory: { type: String, required: true },
  modifiedByUser: { type: Boolean, default: true },
  modifiedDate: { type: Date, default: Date.now },
})

export const Statement = mongoose.models.Statement || model('Statement', statementSchema)
export const Transaction = mongoose.models.Transaction || model('Transaction', transactionSchema)
export const AuditLog = mongoose.models.AuditLog || model('AuditLog', auditLogSchema)
