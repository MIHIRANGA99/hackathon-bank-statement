import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight,
  CircleDollarSign, Wallet, ArrowLeftRight, FileText,
  CheckCircle2, AlertTriangle, Info, Lightbulb,
} from 'lucide-react'
import {
  ResponsiveContainer, ComposedChart, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { fetchCashflow, CashflowEmptyError } from '@/lib/dashboard/cashflowApi'
import { CATEGORICAL, SEQUENTIAL_BLUE, STATUS, CHART_CHROME } from '@/lib/dashboard/palette'

// ─── Utility ────────────────────────────────────────────────────────────────
function fmt(value) {
  if (value == null) return '—'
  return `$${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function pctLabel(pct) {
  if (pct == null) return null
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct.toFixed(1)}%`
}

// ─── 1. Balance Flow Cards ───────────────────────────────────────────────────
function MoneyMovementSummary({ summary }) {
  const cards = [
    {
      label: 'Starting Balance',
      value: fmt(summary.openingBalance),
      icon: Wallet,
      color: '#2a78d6',
      bg: 'rgba(42,120,214,0.08)',
    },
    {
      label: 'Money In',
      value: `+${fmt(summary.income)}`,
      icon: ArrowUpRight,
      color: STATUS.good,
      bg: 'rgba(12,163,12,0.08)',
    },
    {
      label: 'Money Out',
      value: `-${fmt(summary.expenses)}`,
      icon: ArrowDownRight,
      color: STATUS.critical,
      bg: 'rgba(208,59,59,0.08)',
    },
    {
      label: 'Net Change',
      value: (summary.net >= 0 ? '+' : '') + fmt(summary.net) ,
      icon: ArrowLeftRight,
      color: summary.net >= 0 ? STATUS.good : STATUS.critical,
      bg: summary.net >= 0 ? 'rgba(12,163,12,0.08)' : 'rgba(208,59,59,0.08)',
    },
    {
      label: 'Current Balance',
      value: fmt(summary.closingBalance),
      icon: CircleDollarSign,
      color: '#4a3aa7',
      bg: 'rgba(74,58,167,0.08)',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Money Movement Summary</CardTitle>
        <CardDescription>Overview of your financial movement this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {cards.map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 rounded-xl px-3 py-4 text-center transition-transform duration-200 hover:scale-105"
              style={{ background: bg, border: `1.5px solid ${color}22` }}
            >
              <div className="rounded-full p-2" style={{ background: `${color}18` }}>
                <Icon className="size-5" style={{ color }} />
              </div>
              <p className="text-sm font-bold leading-tight" style={{ color }}>
                {value}
              </p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── 2. Cashflow Health Indicator ───────────────────────────────────────────
function CashflowStatusCard({ status }) {
  const { state, title, description, improvementPct } = status

  const config = {
    positive: {
      icon: CheckCircle2,
      color: STATUS.good,
      bg: 'rgba(12,163,12,0.07)',
      border: STATUS.good,
      emoji: '✓',
    },
    negative: {
      icon: AlertTriangle,
      color: STATUS.critical,
      bg: 'rgba(208,59,59,0.07)',
      border: STATUS.critical,
      emoji: '⚠',
    },
    neutral: {
      icon: Minus,
      color: '#eda100',
      bg: 'rgba(237,161,0,0.07)',
      border: '#eda100',
      emoji: '~',
    },
  }

  const { icon: Icon, color, bg, border } = config[state] || config.neutral

  return (
    <Card style={{ borderColor: `${border}55` }}>
      <CardHeader>
        <CardTitle>Cashflow Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-3 rounded-xl py-6 text-center" style={{ background: bg }}>
          <div className="rounded-full p-3" style={{ background: `${color}20` }}>
            <Icon className="size-8" style={{ color }} />
          </div>
          <p className="text-xl font-bold" style={{ color }}>{title}</p>
          <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
          {improvementPct != null && (
            <div className="flex items-center gap-1.5 rounded-full px-4 py-1.5" style={{ background: `${color}15` }}>
              {improvementPct >= 0 ? (
                <TrendingUp className="size-4" style={{ color }} />
              ) : (
                <TrendingDown className="size-4" style={{ color }} />
              )}
              <span className="text-sm font-semibold" style={{ color }}>
                {pctLabel(improvementPct)} compared to last month
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── 3. Monthly Money Flow (Bar + Line combo) ────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border bg-card px-4 py-3 text-sm shadow-lg">
      <p className="mb-2 font-semibold">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="flex justify-between gap-6">
          <span>{entry.name}</span>
          <span className="font-medium">
            {entry.name === 'Net Change'
              ? (entry.value >= 0 ? '+' : '') + fmt(entry.value)
              : fmt(entry.value)}
          </span>
        </p>
      ))}
    </div>
  )
}

function MonthlyMoneyFlowChart({ monthlyFlows }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Money Flow</CardTitle>
        <CardDescription>Income vs expenses with net cashflow trend</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlyFlows} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={CHART_CHROME.grid} vertical={false} />
              <XAxis
                dataKey="monthLabel"
                stroke={CHART_CHROME.axis}
                tick={{ fill: CHART_CHROME.mutedText, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="rect"
                iconSize={10}
                wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
              />
              <ReferenceLine y={0} stroke={CHART_CHROME.axis} strokeDasharray="4 2" />
              <Bar dataKey="income" name="Money In" fill={STATUS.good} radius={[4, 4, 0, 0]} maxBarSize={36} />
              <Bar dataKey="expenses" name="Money Out" fill={STATUS.critical} radius={[4, 4, 0, 0]} maxBarSize={36} />
              <Line
                type="monotone"
                dataKey="net"
                name="Net Change"
                stroke={SEQUENTIAL_BLUE}
                strokeWidth={2.5}
                dot={{ r: 4, fill: SEQUENTIAL_BLUE, strokeWidth: 2, stroke: '#fff' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── 4. Balance Growth Trend ─────────────────────────────────────────────────
function BalanceGrowthChart({ monthlyFlows }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance Growth Trend</CardTitle>
        <CardDescription>How your account balance has changed over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyFlows} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={SEQUENTIAL_BLUE} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={SEQUENTIAL_BLUE} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={CHART_CHROME.grid} vertical={false} />
              <XAxis
                dataKey="monthLabel"
                stroke={CHART_CHROME.axis}
                tick={{ fill: CHART_CHROME.mutedText, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis hide />
              <Tooltip formatter={(v) => [fmt(v), 'Balance']} />
              <Line
                type="monotone"
                dataKey="balance"
                stroke={SEQUENTIAL_BLUE}
                strokeWidth={2.5}
                dot={{ r: 5, fill: SEQUENTIAL_BLUE, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── 5. Money Sources & Spending Breakdown ───────────────────────────────────
function BreakdownSection({ label, items, isIncome }) {
  const total = items.reduce((s, i) => s + i.amount, 0)
  const color = isIncome ? STATUS.good : STATUS.critical
  const sign = isIncome ? '+' : '-'

  return (
    <div className="flex flex-col gap-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
        {isIncome ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
        {label}
      </h3>
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">No data available.</p>
      )}
      {items.map(({ category, amount }, idx) => {
        const pct = total > 0 ? (amount / total) * 100 : 0
        return (
          <div key={category} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="size-2 rounded-full"
                  style={{ background: CATEGORICAL[idx % CATEGORICAL.length] }}
                />
                <span className="capitalize">{category}</span>
              </div>
              <span className="font-semibold" style={{ color }}>
                {sign}{fmt(amount)}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: CATEGORICAL[idx % CATEGORICAL.length] }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MoneyBreakdownCard({ currentBreakdown }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Where Your Money Comes From &amp; Goes</CardTitle>
        <CardDescription>Category breakdown for this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <BreakdownSection
            label="Money In"
            items={currentBreakdown.incomeSources}
            isIncome={true}
          />
          <BreakdownSection
            label="Money Out"
            items={currentBreakdown.expenseSources}
            isIncome={false}
          />
        </div>
      </CardContent>
    </Card>
  )
}

// ─── 6. Monthly Comparison ───────────────────────────────────────────────────
function ComparisonCard({ comparison }) {
  if (!comparison) return null

  const incomeUp = comparison.incomeChangePct >= 0
  const expenseUp = comparison.expenseChangePct >= 0

  const CompareRow = ({ label, thisMonth, lastMonth, changePct, positiveIsGood }) => {
    const isUp = changePct >= 0
    const isGood = positiveIsGood ? isUp : !isUp
    const ArrowIcon = isUp ? TrendingUp : TrendingDown
    const changeColor = isGood ? STATUS.good : STATUS.critical

    return (
      <div className="grid grid-cols-3 items-center gap-4 rounded-xl border px-4 py-4">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-0.5">This Month</p>
          <p className="font-bold">{fmt(thisMonth)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-0.5">Last Month</p>
          <p className="font-medium text-muted-foreground">{fmt(lastMonth)}</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <ArrowIcon className="size-3" style={{ color: changeColor }} />
            <span className="text-xs font-semibold" style={{ color: changeColor }}>
              {pctLabel(changePct)}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cashflow Comparison</CardTitle>
        <CardDescription>This month vs last month</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <CompareRow
          label="Money Received"
          thisMonth={comparison.thisMonthIncome}
          lastMonth={comparison.lastMonthIncome}
          changePct={comparison.incomeChangePct}
          positiveIsGood={true}
        />
        <CompareRow
          label="Money Spent"
          thisMonth={comparison.thisMonthExpense}
          lastMonth={comparison.lastMonthExpense}
          changePct={comparison.expenseChangePct}
          positiveIsGood={false}
        />
      </CardContent>
    </Card>
  )
}

// ─── 7. AI Cashflow Insights ─────────────────────────────────────────────────
function InsightsCard({ insights }) {
  const typeConfig = {
    good: { icon: Lightbulb, color: STATUS.good, bg: 'rgba(12,163,12,0.07)', label: '💡' },
    warning: { icon: AlertTriangle, color: STATUS.warning, bg: 'rgba(250,178,25,0.08)', label: '⚠' },
    info: { icon: Info, color: SEQUENTIAL_BLUE, bg: 'rgba(42,120,214,0.07)', label: 'ℹ' },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cashflow Insights</CardTitle>
        <CardDescription>AI-generated recommendations and alerts</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {insights.map((insight, i) => {
          const cfg = typeConfig[insight.type] || typeConfig.info
          const Icon = cfg.icon
          return (
            <div
              key={i}
              className="flex gap-3 rounded-xl px-4 py-4"
              style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}
            >
              <Icon className="mt-0.5 size-5 shrink-0" style={{ color: cfg.color }} />
              <div className="flex-1">
                <p className="font-semibold" style={{ color: cfg.color }}>{insight.title}</p>
                <p className="mt-1 text-sm text-foreground">{insight.message}</p>
                {insight.recommendation && (
                  <p className="mt-2 text-xs font-medium text-muted-foreground">
                    Recommendation: {insight.recommendation}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export function CashflowPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [isEmpty, setIsEmpty] = useState(false)

  useEffect(() => {
    fetchCashflow()
      .then(setData)
      .catch((err) => {
        if (err instanceof CashflowEmptyError) {
          setIsEmpty(true)
        } else {
          setError('Could not load cashflow data right now. Please try again shortly.')
        }
      })
  }, [])

  if (isEmpty) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
        <CircleDollarSign className="size-12 text-muted-foreground/40" />
        <h1 className="text-3xl font-bold tracking-tight">Money Movement Overview</h1>
        <p className="text-muted-foreground">
          No statements analyzed yet. Upload a bank statement to see your cashflow insights here.
        </p>
        <Button render={<Link to="/analyser" />} nativeButton={false}>
          <FileText className="size-4" />
          Go to Account Statement Analyser
        </Button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
        <AlertTriangle className="size-10 text-destructive" />
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-muted-foreground">Loading your cashflow overview…</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Money Movement Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A clear picture of your cashflow — where your money comes from and where it goes.
          </p>
        </div>
        <Button render={<Link to="/analyser" />} nativeButton={false}>
          <FileText className="size-4" />
          Upload Statement
        </Button>
      </div>

      {/* Current Balance Hero */}
      <div
        className="flex flex-col items-center justify-center gap-2 rounded-2xl py-10 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(42,120,214,0.12) 0%, rgba(74,58,167,0.10) 100%)',
          border: '1.5px solid rgba(42,120,214,0.18)',
        }}
      >
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Current Balance</p>
        <p className="text-5xl font-bold tracking-tight" style={{ color: SEQUENTIAL_BLUE }}>
          {fmt(data.summary.closingBalance)}
        </p>
        {data.status.improvementPct != null && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            {data.status.improvementPct >= 0
              ? <TrendingUp className="size-4" style={{ color: STATUS.good }} />
              : <TrendingDown className="size-4" style={{ color: STATUS.critical }} />
            }
            <span>
              {pctLabel(data.status.improvementPct)} net change vs last month
            </span>
          </p>
        )}
      </div>

      {/* Row 1: Money Movement Summary */}
      <MoneyMovementSummary summary={data.summary} />

      {/* Row 2: Status + Comparison */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <CashflowStatusCard status={data.status} />
        <ComparisonCard comparison={data.comparison} />
      </div>

      {/* Row 3: Monthly Money Flow Chart */}
      <MonthlyMoneyFlowChart monthlyFlows={data.monthlyFlows} />

      {/* Row 4: Balance Trend */}
      <BalanceGrowthChart monthlyFlows={data.monthlyFlows} />

      {/* Row 5: Category Breakdown */}
      <MoneyBreakdownCard currentBreakdown={data.currentBreakdown} />

      {/* Row 6: AI Insights */}
      <InsightsCard insights={data.insights} />
    </div>
  )
}
