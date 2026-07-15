import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { STATUS_COLORS } from '@/lib/dashboard/palette'

function formatCurrency(value) {
  const sign = value < 0 ? '-' : '+'
  return `${sign}LKR ${Math.abs(value).toLocaleString()}`
}

function TransactionList({ items }) {
  return (
    <ol className="flex flex-col gap-3">
      {items.map((t, i) => (
        <li key={`${t.description}-${t.date}-${i}`} className="flex items-center justify-between text-sm">
          <span>
            {i + 1}. {t.description}
          </span>
          <span className={t.amount < 0 ? 'text-foreground' : 'font-medium'} style={t.amount >= 0 ? { color: STATUS_COLORS.good } : undefined}>
            {formatCurrency(t.amount)}
          </span>
        </li>
      ))}
    </ol>
  )
}

export function SignificantTransactionsCard({ significantTransactions }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Significant Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="expenses">
          <TabsList>
            <TabsTrigger value="expenses">Highest Expenses</TabsTrigger>
            <TabsTrigger value="credits">Largest Credits</TabsTrigger>
          </TabsList>
          <TabsContent value="expenses" className="mt-3">
            <TransactionList items={significantTransactions.highestExpenses} />
          </TabsContent>
          <TabsContent value="credits" className="mt-3">
            <TransactionList items={significantTransactions.largestCredits} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
