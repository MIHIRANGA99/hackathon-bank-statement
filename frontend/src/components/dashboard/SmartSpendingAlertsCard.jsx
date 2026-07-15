import { AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { STATUS } from '@/lib/dashboard/palette'

function formatCurrency(value) {
  return `$${value.toLocaleString()}`
}

export function SmartSpendingAlertsCard({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Smart Spending Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No unusual spending detected.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card style={{ borderColor: STATUS.warning }}>
      <CardHeader>
        <CardTitle>Smart Spending Alerts</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {alerts.map((alert, i) => (
          <div
            key={i}
            className="flex gap-3 rounded-md border px-3 py-3"
            style={{ borderColor: STATUS.warning, backgroundColor: 'color-mix(in oklch, ' + STATUS.warning + ' 10%, transparent)' }}
          >
            <AlertTriangle className="mt-0.5 size-5 shrink-0" style={{ color: STATUS.warning }} />
            <div className="flex-1">
              <p className="font-medium">{alert.title}</p>
              <p className="text-sm">{alert.message}</p>

              {alert.type === 'spending_spike' && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Previous month: {formatCurrency(alert.previousMonth)} → This month:{' '}
                  {formatCurrency(alert.currentMonth)}
                </p>
              )}
              {alert.type === 'unusual_transaction' && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Merchant: {alert.merchant} · Amount: {formatCurrency(alert.amount)} · {alert.multiplier}x higher
                  than your average purchase
                </p>
              )}

              {alert.suggestion && (
                <p className="mt-2 text-sm font-medium">Suggestion: {alert.suggestion}</p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
