import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

function StatCard({ title, value, subtitle, className, style }) {
  return (
    <Card className={`overflow-hidden ${className || ''}`} style={style}>
      <CardContent className="py-4 px-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}

export function DashboardStats() {
  return (
    <div className="w-full max-w-5xl">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard
          title="Overdue"
          value="$24,850.00"
          subtitle="+12.5% from last month"
          style={{ background: 'linear-gradient(90deg, var(--brand-600), var(--brand-400))', color: 'white' }}
        />

        <StatCard
          title="Due within next month"
          value="$142,560.00"
          subtitle="Invoices due"
        />

        <StatCard
          title="Avg time to get paid"
          value="16 days"
          subtitle="-2 days from last month"
        />

        <StatCard
          title="Available for payout"
          value="$186,540.00"
          subtitle="Estimate"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardContent className="py-6 px-6">
            <p className="text-sm text-muted-foreground">Invoices</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-2xl font-bold"># INV-1003</p>
              <button className="rounded-md bg-primary px-3 py-1 text-white">Payout now</button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Subtotal</p>
                <p className="font-bold mt-1">$47,980.00</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-bold mt-1">$47,980.00</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Balance Due</p>
                <p className="font-bold mt-1">$47,980.00</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6 px-6">
            <p className="text-sm text-muted-foreground">Active filters</p>
            <div className="mt-4 text-sm text-muted-foreground">All customers · All statuses</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardStats
