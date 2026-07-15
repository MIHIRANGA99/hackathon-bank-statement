import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CHART_TOOLTIP_STYLE } from '@/lib/dashboard/palette'
import { useChartPalette } from '@/lib/dashboard/useChartPalette'

function formatCurrency(value) {
  return `$${value.toLocaleString()}`
}

export function IncomeOverviewCard({ income }) {
  const { sequentialBlue, chrome, status } = useChartPalette()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={income.trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={chrome.grid} vertical={false} />
              <XAxis
                dataKey="month"
                stroke={chrome.axis}
                tick={{ fill: chrome.mutedText, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis hide />
              <Tooltip formatter={(value) => formatCurrency(value)} {...CHART_TOOLTIP_STYLE} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke={sequentialBlue}
                strokeWidth={2}
                dot={{ r: 4, fill: sequentialBlue }}
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
            <p className="text-lg font-bold" style={{ color: status.good }}>
              +{income.growthPct}%
            </p>
            <p className="text-xs text-muted-foreground">Income Growth</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
