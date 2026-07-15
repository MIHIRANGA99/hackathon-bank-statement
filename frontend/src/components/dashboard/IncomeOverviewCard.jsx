import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SEQUENTIAL_BLUE, CHART_CHROME } from '@/lib/dashboard/palette'

function formatCurrency(value) {
  return `$${value.toLocaleString()}`
}

export function IncomeOverviewCard({ income }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Income Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={income.trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={CHART_CHROME.grid} vertical={false} />
              <XAxis
                dataKey="month"
                stroke={CHART_CHROME.axis}
                tick={{ fill: CHART_CHROME.mutedText, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis hide />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke={SEQUENTIAL_BLUE}
                strokeWidth={2}
                dot={{ r: 4, fill: SEQUENTIAL_BLUE }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold">{formatCurrency(income.total)}</p>
            <p className="text-xs text-muted-foreground">Total Income</p>
          </div>
          <div>
            <p className="text-lg font-bold">{formatCurrency(income.averageMonthly)}</p>
            <p className="text-xs text-muted-foreground">Average Monthly</p>
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: '#0ca30c' }}>
              +{income.growthPct}%
            </p>
            <p className="text-xs text-muted-foreground">Income Growth</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
