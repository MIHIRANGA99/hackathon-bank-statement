import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fetchDashboard, DashboardEmptyError } from '@/lib/dashboard/api'
import { FinancialHealthCard } from '@/components/dashboard/FinancialHealthCard'
import { IncomeOverviewCard } from '@/components/dashboard/IncomeOverviewCard'
import { SpendingOverviewCard } from '@/components/dashboard/SpendingOverviewCard'
import { SavingsProgressCard } from '@/components/dashboard/SavingsProgressCard'
import { SpendingBehaviorCard } from '@/components/dashboard/SpendingBehaviorCard'
import { SignificantTransactionsCard } from '@/components/dashboard/SignificantTransactionsCard'
import { RecurringPaymentsCard } from '@/components/dashboard/RecurringPaymentsCard'
import { SmartSpendingAlertsCard } from '@/components/dashboard/SmartSpendingAlertsCard'

function CenteredState({ children }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <div className="glass-panel flex flex-col items-center gap-4 rounded-3xl px-10 py-12">
        {children}
      </div>
    </div>
  )
}

export function DashboardPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [isEmpty, setIsEmpty] = useState(false)

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch((err) => {
        if (err instanceof DashboardEmptyError) {
          setIsEmpty(true)
        } else {
          setError('Could not load your dashboard right now. Please try again shortly.')
        }
      })
  }, [])

  if (isEmpty) {
    return (
      <CenteredState>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          No statements analyzed yet. Upload one to see your financial insights here.
        </p>
        <Button render={<Link to="/analyser" />} nativeButton={false}>
          <FileText className="size-4" />
          Go to Account Statement Analyser
        </Button>
      </CenteredState>
    )
  }

  if (error) {
    return (
      <CenteredState>
        <p className="text-muted-foreground">{error}</p>
      </CenteredState>
    )
  }

  if (!data) {
    return (
      <CenteredState>
        <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Loading your dashboard…</p>
      </CenteredState>
    )
  }

  return (
    <div className="w-full">
      <h1 className="mb-4 text-2xl font-bold tracking-tight">Dashboard</h1>

      {/*
        Masonry flow (CSS multi-column), not CSS Grid: with a grid, two
        cards sharing a row are forced to the SAME row height (the taller
        card's height), leaving dead space inside the shorter card's cell
        even with items-start. Columns give each card independent
        top-to-bottom flow, sized to its own content only.
      */}
      <div className="columns-1 gap-4 lg:columns-2 xl:columns-3">
        <div className="mb-4 break-inside-avoid">
          <FinancialHealthCard score={data.healthScore.score} label={data.healthScore.label} />
        </div>
        <div className="mb-4 break-inside-avoid">
          <IncomeOverviewCard income={data.income} />
        </div>
        <div className="mb-4 break-inside-avoid">
          <SpendingOverviewCard expenses={data.expenses} />
        </div>
        <div className="mb-4 break-inside-avoid">
          <SavingsProgressCard savings={data.savings} />
        </div>
        <div className="mb-4 break-inside-avoid">
          <SpendingBehaviorCard spendingBehavior={data.spendingBehavior} />
        </div>
        <div className="mb-4 break-inside-avoid">
          <SignificantTransactionsCard significantTransactions={data.significantTransactions} />
        </div>
        <div className="mb-4 break-inside-avoid">
          <RecurringPaymentsCard recurringPayments={data.recurringPayments} />
        </div>
        <div className="mb-4 break-inside-avoid">
          <SmartSpendingAlertsCard alerts={data.alerts} />
        </div>
      </div>
    </div>
  )
}
