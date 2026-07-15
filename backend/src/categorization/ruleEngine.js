// Deterministic, keyword-based categorization. Checked before any AI call —
// only descriptions that don't match anything here get sent to DeepSeek.
// Order matters: more specific rules are listed before generic ones.
const RULES = [
  // Generic/unknown transaction codes (Feature 3.4) — these are
  // inherently un-categorizable from the description alone, so they go
  // straight to Other instead of wasting an AI call on them.
  {
    category: 'Other',
    keywords: [
      'pos payment',
      'pos txn',
      'card purchase',
      'atm transaction',
      'eft transfer',
      'unknown merchant',
    ],
  },
  { category: 'Income', keywords: ['salary', 'payroll', 'payslip'] },
  {
    category: 'Groceries',
    keywords: ['woolworths', 'coles', 'supermarket', 'grocery', 'groceries', 'fresh mart', 'green valley'],
  },
  {
    category: 'Utilities',
    keywords: ['electric', 'utility', 'utilities', 'power', 'water', 'broadband', 'internet'],
  },
  { category: 'Transport', keywords: ['uber', 'taxi', 'transport', 'fuel', 'petrol', 'lyft'] },
  {
    category: 'Dining',
    keywords: ['restaurant', 'cafe', 'coffee', 'takeaway', 'bistro', 'dining', 'wok', 'dragon', 'diner'],
  },
  { category: 'Subscriptions', keywords: ['netflix', 'spotify', 'subscription', 'prime video', 'disney+'] },
  { category: 'Loan Payments', keywords: ['loan', 'mortgage', 'installment'] },
  { category: 'Fees', keywords: ['account fee', 'bank fee', 'service fee', 'monthly fee'] },
  { category: 'Transfers', keywords: ['transfer to', 'transfer from', 'funds transfer'] },
  { category: 'Cash Withdrawals', keywords: ['atm withdrawal', 'cash withdrawal'] },
  { category: 'Shopping', keywords: ['electronics', 'department store', 'retail', 'shopping'] },
  { category: 'Healthcare', keywords: ['pharmacy', 'clinic', 'hospital', 'medical', 'dental'] },
  { category: 'Entertainment', keywords: ['cinema', 'movie', 'theatre', 'concert', 'entertainment'] },
  { category: 'Education', keywords: ['school', 'tuition', 'university', 'college', 'course fee'] },
  { category: 'Travel', keywords: ['airline', 'airways', 'hotel', 'flight', 'travel agency'] },
]

// Returns { category, confidence: 100, source: 'rule' } on a keyword
// match, or null if nothing matched (caller should fall back to AI).
export function matchRule(description) {
  const text = String(description || '').toLowerCase()
  for (const rule of RULES) {
    if (rule.keywords.some((kw) => text.includes(kw))) {
      return { category: rule.category, confidence: 100, source: 'rule' }
    }
  }
  return null
}
