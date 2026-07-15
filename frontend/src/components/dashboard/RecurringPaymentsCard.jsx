import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function formatCurrency(value) {
  return `LKR ${value.toLocaleString()}`
}

export function RecurringPaymentsCard({ recurringPayments }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recurring Payments</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {recurringPayments.items.map((item) => (
          <div key={item.merchant} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
            <div>
              <p className="font-medium">{item.merchant}</p>
              <Badge variant="secondary" className="text-[0.65rem]">
                {item.category}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{formatCurrency(item.amount)}/month</p>
          </div>
        ))}

        <div className="mt-1 flex items-center justify-between rounded-md bg-muted/40 px-3 py-2 text-sm">
          <span>Monthly recurring commitment</span>
          <span className="font-bold">{formatCurrency(recurringPayments.monthlyTotal)}/month</span>
        </div>
      </CardContent>
    </Card>
  )
}
