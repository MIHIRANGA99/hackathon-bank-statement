// Hardcoded mock payload for GET /api/dashboard, shaped exactly like what a
// real MongoDB-backed aggregation would return in a future module. Nothing
// here is computed — it's fixture data so the frontend dashboard UI can be
// built and demoed ahead of that backend work.
export const MOCK_DASHBOARD_DATA = {
  healthScore: {
    score: 85,
    label: 'Good Financial Health',
  },
  income: {
    total: 85000,
    averageMonthly: 7083,
    growthPct: 12,
    trend: [
      { month: 'Jan', amount: 5000 },
      { month: 'Feb', amount: 6000 },
      { month: 'Mar', amount: 5500 },
      { month: 'Apr', amount: 7000 },
      { month: 'May', amount: 8500 },
    ],
  },
  expenses: {
    total: 5200,
    byCategory: [
      { category: 'Dining', amount: 1820, pct: 35 },
      { category: 'Utilities', amount: 1040, pct: 20 },
      { category: 'Transport', amount: 936, pct: 18 },
      { category: 'Shopping', amount: 780, pct: 15 },
      { category: 'Other', amount: 624, pct: 12 },
    ],
  },
  savings: {
    amount: 3300,
    rate: 38.8,
    vsLastMonthPct: 5,
    trend: [
      { month: 'Jan', amount: 2000 },
      { month: 'Feb', amount: 3000 },
      { month: 'Mar', amount: 2500 },
      { month: 'Apr', amount: 4000 },
    ],
  },
  spendingBehavior: [
    { category: 'Dining', previousMonth: 450, currentMonth: 720, changePct: 60, flag: 'Higher than usual' },
    { category: 'Transport', previousMonth: 300, currentMonth: 280, changePct: -7, flag: null },
    { category: 'Shopping', previousMonth: 400, currentMonth: 610, changePct: 53, flag: 'Higher than usual' },
  ],
  significantTransactions: {
    highestExpenses: [
      { description: 'Amazon Purchase', amount: -1250, date: '2026-04-12' },
      { description: 'Rent Payment', amount: -1000, date: '2026-04-01' },
      { description: 'Electronics Depot', amount: -450, date: '2026-04-18' },
    ],
    largestCredits: [
      { description: 'Salary', amount: 5000, date: '2026-04-01' },
      { description: 'Bonus', amount: 1500, date: '2026-04-15' },
      { description: 'Freelance Payment', amount: 600, date: '2026-04-20' },
    ],
  },
  recurringPayments: {
    items: [
      { merchant: 'Netflix', category: 'Entertainment', amount: 15 },
      { merchant: 'Electricity Bill', category: 'Utilities', amount: 120 },
      { merchant: 'Spotify', category: 'Subscriptions', amount: 10 },
      { merchant: 'Gym Membership', category: 'Healthcare', amount: 45 },
    ],
    monthlyTotal: 450,
  },
  alerts: [
    {
      type: 'spending_spike',
      title: 'Spending Alert',
      message: 'Your Dining expenses increased by 75%',
      previousMonth: 300,
      currentMonth: 525,
      suggestion: 'Consider reducing dining expenses by $150',
    },
    {
      type: 'unusual_transaction',
      title: 'Unusual Transaction Detected',
      message: 'Large payment detected',
      merchant: 'XYZ Electronics',
      amount: 2800,
      multiplier: 4,
    },
  ],
}
