import { useState } from 'react'
import { StatementUpload } from '@/components/StatementUpload'
import { TransactionTable } from '@/components/TransactionTable'
import { Card, CardContent } from '@/components/ui/card'
import { useCategorization } from '@/lib/categorization/useCategorization'
import { useTransactionRepository } from '@/lib/transactions/useTransactionRepository'

export function AnalyserPage() {
  const [transactions, setTransactions] = useState(null)
  const [sourceFileName, setSourceFileName] = useState(null)

  const { categorizedTransactions, isLoading, updateCategory, bulkUpdateCategory, summary } =
    useCategorization(transactions, sourceFileName)
  const repo = useTransactionRepository(categorizedTransactions)

  const handleParsed = (parsedTransactions, fileName) => {
    setTransactions(parsedTransactions)
    setSourceFileName(fileName)
  }

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Account Statement <span className="brand-gradient-text">Analyser</span>
        </h1>
        <p className="text-muted-foreground">Upload a bank statement to get started.</p>
      </div>

      <StatementUpload onParsed={handleParsed} />

      {transactions && (
        <div className="w-full max-w-5xl">
          <p className="mb-3 text-sm text-muted-foreground">
            Loaded {transactions.length} transactions from <strong>{sourceFileName}</strong>
            {isLoading && ' — categorizing…'}
          </p>

          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Card
              className="cursor-pointer transition-colors hover:bg-foreground/5"
              onClick={() => repo.setReviewOnly(true)}
            >
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground">Review Needed</p>
                <p className="text-2xl font-bold">{summary.needsReview} Transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4">
                <p className="mb-1 text-sm text-muted-foreground">Categorization Accuracy</p>
                <div className="grid grid-cols-4 gap-2 text-center text-sm">
                  <div>
                    <p className="font-bold">{summary.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div>
                    <p className="font-bold">{summary.autoCategorized}</p>
                    <p className="text-xs text-muted-foreground">Auto</p>
                  </div>
                  <div>
                    <p className="font-bold">{summary.needsReview}</p>
                    <p className="text-xs text-muted-foreground">Review</p>
                  </div>
                  <div>
                    <p className="font-bold">{summary.userCorrected}</p>
                    <p className="text-xs text-muted-foreground">Corrected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <TransactionTable
            repo={repo}
            onUpdateCategory={updateCategory}
            onBulkUpdateCategory={bulkUpdateCategory}
          />
        </div>
      )}
    </div>
  )
}
