import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CHART_TOOLTIP_STYLE } from '@/lib/dashboard/palette'
import { useChartPalette } from '@/lib/dashboard/useChartPalette'

function formatCurrency(value) {
  return `$${value.toLocaleString()}`
}

export function SpendingOverviewCard({ expenses }) {
  const { categorical } = useChartPalette()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Where Your Money Goes</CardTitle>
        <p className="text-sm text-muted-foreground">
          Monthly Expenses: <span className="font-medium">{formatCurrency(expenses.total)}</span>
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="h-48 w-full sm:w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenses.byCategory}
                dataKey="amount"
                nameKey="category"
                innerRadius="60%"
                outerRadius="90%"
                paddingAngle={2}
              >
                {expenses.byCategory.map((entry, i) => (
                  <Cell key={entry.category} fill={categorical[i % categorical.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} {...CHART_TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full sm:w-1/2">
          <p className="mb-2 text-sm font-medium">Top Spending Categories</p>
          <ol className="flex flex-col gap-2">
            {expenses.byCategory.map((c, i) => (
              <li key={c.category} className="flex items-center gap-2 text-sm">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: categorical[i % categorical.length] }}
                />
                <span className="flex-1">
                  {i + 1}. {c.category}
                </span>
                <span className="text-muted-foreground">
                  {formatCurrency(c.amount)} ({c.pct}%)
                </span>
              </li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
