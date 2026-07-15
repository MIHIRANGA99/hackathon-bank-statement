import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CHART_TOOLTIP_STYLE } from '@/lib/dashboard/palette'
import { useChartPalette } from '@/lib/dashboard/useChartPalette'

function formatCurrency(value) {
  return `$${value.toLocaleString()}`
}

function rateLabel(rate, status) {
  if (rate >= 30) return { text: 'Excellent', color: status.good }
  if (rate >= 15) return { text: 'Good', color: status.warning }
  return { text: 'Needs attention', color: status.critical }
}

export function SavingsProgressCard({ savings }) {
  const { sequentialBlue, chrome, status } = useChartPalette()
  const { text, color } = rateLabel(savings.rate, status)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Savings Progress</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Your Savings Rate</span>
            <span className="font-medium" style={{ color }}>
              {savings.rate}% · {text}
            </span>
          </div>
          <Progress value={savings.rate} />
          <p className="mt-1 text-xs text-muted-foreground">
            {formatCurrency(savings.amount)} saved
            {savings.vsLastMonthPct != null && (
              <> · {savings.vsLastMonthPct >= 0 ? '↑' : '↓'} {Math.abs(savings.vsLastMonthPct)}% vs last month</>
            )}
          </p>
        </div>

        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={savings.trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
      </CardContent>
    </Card>
  )
}
