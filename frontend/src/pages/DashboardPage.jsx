import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fetchDashboard } from '@/lib/dashboard/api'
import { FinancialHealthCard } from '@/components/dashboard/FinancialHealthCard'
import { IncomeOverviewCard } from '@/components/dashboard/IncomeOverviewCard'
import { SpendingOverviewCard } from '@/components/dashboard/SpendingOverviewCard'
import { SavingsProgressCard } from '@/components/dashboard/SavingsProgressCard'
import { SpendingBehaviorCard } from '@/components/dashboard/SpendingBehaviorCard'
import { SignificantTransactionsCard } from '@/components/dashboard/SignificantTransactionsCard'
import { RecurringPaymentsCard } from '@/components/dashboard/RecurringPaymentsCard'
import { SmartSpendingAlertsCard } from '@/components/dashboard/SmartSpendingAlertsCard'

export function DashboardPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch(() => setError('Could not load your dashboard right now. Please try again shortly.'))
  }, [])

  if (error) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-muted-foreground">Loading your dashboard…</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col items-center gap-6 px-4 py-12">
      <div className="flex w-full max-w-5xl items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button render={<Link to="/analyser" />} nativeButton={false}>
          <FileText className="size-4" />
          Go to Account Statement Analyser
        </Button>
      </div>

      <div className="grid w-full max-w-5xl grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <FinancialHealthCard score={data.healthScore.score} label={data.healthScore.label} />
        </div>
        <div className="lg:col-span-2">
          <IncomeOverviewCard income={data.income} />
        </div>

        <div className="lg:col-span-2">
          <SpendingOverviewCard expenses={data.expenses} />
        </div>
        <div className="lg:col-span-1">
          <SavingsProgressCard savings={data.savings} />
        </div>

        <div className="lg:col-span-1">
          <SpendingBehaviorCard spendingBehavior={data.spendingBehavior} />
        </div>
        <div className="lg:col-span-1">
          <SignificantTransactionsCard significantTransactions={data.significantTransactions} />
        </div>
        <div className="lg:col-span-1">
          <RecurringPaymentsCard recurringPayments={data.recurringPayments} />
        </div>

        <div className="lg:col-span-3">
          <SmartSpendingAlertsCard alerts={data.alerts} />
        </div>
      </div>
    </div>
  )
}
