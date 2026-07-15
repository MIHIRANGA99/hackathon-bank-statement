import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { SEQUENTIAL_BLUE, CHART_CHROME, STATUS } from '@/lib/dashboard/palette'

function formatCurrency(value) {
  return `$${value.toLocaleString()}`
}

function rateLabel(rate) {
  if (rate >= 30) return { text: 'Excellent', color: STATUS.good }
  if (rate >= 15) return { text: 'Good', color: STATUS.warning }
  return { text: 'Needs attention', color: STATUS.critical }
}

export function SavingsProgressCard({ savings }) {
  const { text, color } = rateLabel(savings.rate)

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
      </CardContent>
    </Card>
  )
}
