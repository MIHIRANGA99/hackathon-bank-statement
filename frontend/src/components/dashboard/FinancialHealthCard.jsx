import { Card, CardContent } from '@/components/ui/card'
import { STATUS } from '@/lib/dashboard/palette'

function scoreColor(score) {
  if (score >= 80) return STATUS.good
  if (score >= 60) return STATUS.warning
  if (score >= 40) return STATUS.serious
  return STATUS.critical
}

export function FinancialHealthCard({ score, label }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-1 py-6 text-center">
        <p className="text-sm text-muted-foreground">Financial Health Score</p>
        <p className="text-5xl font-bold" style={{ color: scoreColor(score) }}>
          {score}
          <span className="text-2xl text-muted-foreground">/100</span>
        </p>
        <p className="text-sm font-medium">{label}</p>
      </CardContent>
    </Card>
  )
}
