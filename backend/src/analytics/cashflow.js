import { formatMonthLabel, round2, sortedMonthKeys, sum } from './helpers.js'

export function computeCashflowData(transactions) {
  if (!transactions || transactions.length === 0) {
    return null
  }

  // Sort transactions chronologically
  const sortedTx = [...transactions].sort((a, b) => a.date.localeCompare(b.date))
  const months = sortedMonthKeys(sortedTx)

  if (months.length === 0) {
    return null
  }

  // Compute month-by-month cashflow details
  const monthlyFlows = []
  let previousClosingBalance = null

  for (let i = 0; i < months.length; i++) {
    const key = months[i]
    const txInMonth = sortedTx.filter((t) => t.date.slice(0, 7) === key)

    const income = round2(sum(txInMonth.filter((t) => t.credit != null).map((t) => t.credit)))
    const expenses = round2(sum(txInMonth.filter((t) => t.debit != null).map((t) => t.debit)))
    const net = round2(income - expenses)

    // Closing balance: find the last transaction in this month that has a balance
    let closingBalance = null
    for (let j = txInMonth.length - 1; j >= 0; j--) {
      if (txInMonth[j].balance != null) {
        closingBalance = txInMonth[j].balance
        break
      }
    }

    // Opening balance logic
    let openingBalance = null
    if (previousClosingBalance !== null) {
      openingBalance = previousClosingBalance
    } else {
      // First month: find the first transaction with a balance, trace back
      const firstWithBalanceIdx = txInMonth.findIndex((t) => t.balance != null)
      if (firstWithBalanceIdx !== -1) {
        let bal = txInMonth[firstWithBalanceIdx].balance
        // trace back to the start of the month
        for (let k = firstWithBalanceIdx; k >= 0; k--) {
          const t = txInMonth[k]
          if (t.credit != null) bal -= t.credit
          if (t.debit != null) bal += t.debit
        }
        openingBalance = round2(bal)
      } else {
        openingBalance = 0
      }
    }

    if (closingBalance === null) {
      closingBalance = round2(openingBalance + net)
    }

    previousClosingBalance = closingBalance

    // Category breakdown for this month
    const incomeSourcesMap = new Map()
    const expenseSourcesMap = new Map()

    for (const t of txInMonth) {
      if (t.credit != null) {
        incomeSourcesMap.set(t.category, (incomeSourcesMap.get(t.category) || 0) + t.credit)
      }
      if (t.debit != null) {
        expenseSourcesMap.set(t.category, (expenseSourcesMap.get(t.category) || 0) + t.debit)
      }
    }

    const incomeSources = Array.from(incomeSourcesMap.entries())
      .map(([category, amount]) => ({ category, amount: round2(amount) }))
      .sort((a, b) => b.amount - a.amount)

    const expenseSources = Array.from(expenseSourcesMap.entries())
      .map(([category, amount]) => ({ category, amount: round2(amount) }))
      .sort((a, b) => b.amount - a.amount)

    monthlyFlows.push({
      monthKey: key,
      monthLabel: formatMonthLabel(key),
      openingBalance,
      income,
      expenses,
      net,
      closingBalance,
      incomeSources,
      expenseSources,
    })
  }

  // Get current (latest) month and last month data
  const currentMonthData = monthlyFlows[monthlyFlows.length - 1]
  const lastMonthData = monthlyFlows.length >= 2 ? monthlyFlows[monthlyFlows.length - 2] : null

  // Cashflow status logic
  let status = 'neutral'
  let statusTitle = 'Balanced Cashflow'
  let statusDesc = 'Your income and expenses are balanced.'
  if (currentMonthData.net > 0) {
    status = 'positive'
    statusTitle = 'Positive Cashflow'
    statusDesc = 'Your balance increased this month. You received more money than you spent.'
  } else if (currentMonthData.net < 0) {
    status = 'negative'
    statusTitle = 'Negative Cashflow'
    statusDesc = `You spent $${Math.abs(currentMonthData.net).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} more than you received.`
  }

  // Improvement comparison compared to last month
  let improvementPct = null
  if (lastMonthData) {
    // If net change is better (more positive/less negative)
    const prevNet = lastMonthData.net
    const currNet = currentMonthData.net
    if (prevNet !== 0) {
      improvementPct = round2(((currNet - prevNet) / Math.abs(prevNet)) * 100)
    } else {
      improvementPct = currNet > 0 ? 100 : currNet < 0 ? -100 : 0
    }
  }

  // AI Cashflow Insights
  const insights = []
  
  // 1. Spending comparison insight
  if (lastMonthData) {
    const expenseDiffPct = lastMonthData.expenses > 0 
      ? round2(((lastMonthData.expenses - currentMonthData.expenses) / lastMonthData.expenses) * 100)
      : 0
    
    if (expenseDiffPct > 0 && currentMonthData.net > lastMonthData.net) {
      insights.push({
        type: 'good',
        title: 'Good Progress',
        message: `Your savings increased because your expenses were ${expenseDiffPct}% lower than last month.`,
      })
    }
  }

  // 2. Multi-month negative cashflow alert
  let consecutiveNegativeMonths = 0
  for (let idx = monthlyFlows.length - 1; idx >= 0; idx--) {
    if (monthlyFlows[idx].net < 0) {
      consecutiveNegativeMonths++
    } else {
      break
    }
  }

  if (consecutiveNegativeMonths >= 2) {
    // Find top expenses categories for current month to recommend reviewing
    const topExpenses = currentMonthData.expenseSources.slice(0, 2).map((e) => e.category)
    const recommendation = topExpenses.length > 0 
      ? `Review ${topExpenses.join(' and ')} expenses.` 
      : 'Review your monthly spending patterns.'
    
    insights.push({
      type: 'warning',
      title: 'Attention Needed',
      message: `Your expenses exceeded income for ${consecutiveNegativeMonths} consecutive months.`,
      recommendation,
    })
  } else if (currentMonthData.net < 0) {
    insights.push({
      type: 'warning',
      title: 'Net Outflow Alert',
      message: `You have a negative cashflow of -$${Math.abs(currentMonthData.net).toLocaleString(undefined, { minimumFractionDigits: 2 })} this month.`,
      recommendation: 'Check if you have one-off large purchases or if recurring costs have increased.',
    })
  }

  // Default helper insight if empty
  if (insights.length === 0) {
    insights.push({
      type: 'info',
      title: 'Stable Balance',
      message: 'Your money inflows and outflows are stable. Keep tracking to identify potential saving opportunities.',
    })
  }

  return {
    summary: {
      openingBalance: currentMonthData.openingBalance,
      income: currentMonthData.income,
      expenses: currentMonthData.expenses,
      net: currentMonthData.net,
      closingBalance: currentMonthData.closingBalance,
    },
    status: {
      state: status,
      title: statusTitle,
      description: statusDesc,
      improvementPct,
    },
    monthlyFlows: monthlyFlows.map((f) => ({
      monthKey: f.monthKey,
      monthLabel: f.monthLabel,
      income: f.income,
      expenses: f.expenses,
      net: f.net,
      balance: f.closingBalance,
    })),
    currentBreakdown: {
      incomeSources: currentMonthData.incomeSources,
      expenseSources: currentMonthData.expenseSources,
    },
    comparison: lastMonthData ? {
      thisMonthIncome: currentMonthData.income,
      lastMonthIncome: lastMonthData.income,
      incomeChangePct: lastMonthData.income > 0 ? round2(((currentMonthData.income - lastMonthData.income) / lastMonthData.income) * 100) : 0,
      thisMonthExpense: currentMonthData.expenses,
      lastMonthExpense: lastMonthData.expenses,
      expenseChangePct: lastMonthData.expenses > 0 ? round2(((currentMonthData.expenses - lastMonthData.expenses) / lastMonthData.expenses) * 100) : 0,
    } : null,
    insights,
  }
}
