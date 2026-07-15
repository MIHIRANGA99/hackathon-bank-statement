import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { STATUS_COLORS } from '@/lib/dashboard/palette'

function formatCurrency(value) {
  return `LKR ${value.toLocaleString()}`
}

export function SpendingBehaviorCard({ spendingBehavior }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Behavior</CardTitle>
        <p className="text-sm text-muted-foreground">This month vs last month</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {spendingBehavior.map((row) => {
          const up = row.changePct >= 0
          return (
            <div key={row.category} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
              <div>
                <p className="font-medium">{row.category}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(row.previousMonth)} → {formatCurrency(row.currentMonth)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium" style={{ color: up ? STATUS_COLORS.serious : STATUS_COLORS.good }}>
                  {up ? '↑' : '↓'} {Math.abs(row.changePct)}%
                </p>
                {row.flag && (
                  <Badge variant="outline" className="mt-1 text-[0.65rem]">
                    ⚠ {row.flag}
                  </Badge>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
