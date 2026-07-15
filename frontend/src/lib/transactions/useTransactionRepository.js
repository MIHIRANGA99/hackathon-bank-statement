import { useMemo, useState } from 'react'

const SORTABLE_NUMERIC_FIELDS = new Set(['debit', 'credit', 'balance'])

// In-memory, session-scoped transaction repository. Wraps the normalized
// transaction list from Module 1 and exposes retrieve/search/filter/sort
// capabilities plus pagination for the listing UI. Nothing here persists
// beyond the current React tree — no backend calls, no storage.
export function useTransactionRepository(rawTransactions) {
  const all = useMemo(
    () =>
      (rawTransactions || []).map((t, i) => ({
        id: i,
        category: t.category || 'Uncategorized',
        ...t,
      })),
    [rawTransactions]
  )

  const [search, setSearchState] = useState('')
  const [categoryFilter, setCategoryFilterState] = useState('all')
  const [typeFilter, setTypeFilterState] = useState('all') // all | debit | credit
  const [reviewOnly, setReviewOnlyState] = useState(false)
  const [sortField, setSortField] = useState('date')
  const [sortDirection, setSortDirection] = useState('asc')
  const [page, setPageState] = useState(1)
  const [pageSize, setPageSizeState] = useState(10)

  const categories = useMemo(
    () => Array.from(new Set(all.map((t) => t.category))).sort(),
    [all]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return all.filter((t) => {
      if (q) {
        const haystack = `${t.description} ${t.reference} ${t.category}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false
      if (typeFilter === 'debit' && t.debit == null) return false
      if (typeFilter === 'credit' && t.credit == null) return false
      if (reviewOnly && !t.needsReview) return false
      return true
    })
  }, [all, search, categoryFilter, typeFilter, reviewOnly])

  const sorted = useMemo(() => {
    const dir = sortDirection === 'asc' ? 1 : -1
    const numeric = SORTABLE_NUMERIC_FIELDS.has(sortField)
    return [...filtered].sort((a, b) => {
      let av = a[sortField]
      let bv = b[sortField]
      if (numeric) {
        av = av == null ? -Infinity : av
        bv = bv == null ? -Infinity : bv
      } else {
        av = String(av ?? '').toLowerCase()
        bv = String(bv ?? '').toLowerCase()
      }
      if (av < bv) return -1 * dir
      if (av > bv) return 1 * dir
      return 0
    })
  }, [filtered, sortField, sortDirection])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageItems = useMemo(
    () => sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [sorted, currentPage, pageSize]
  )

  function toggleSort(field) {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  return {
    // retrieve
    all,
    total: all.length,
    categories,
    // search
    search,
    setSearch: (v) => { setSearchState(v); setPageState(1) },
    // filter
    categoryFilter,
    setCategoryFilter: (v) => { setCategoryFilterState(v); setPageState(1) },
    typeFilter,
    setTypeFilter: (v) => { setTypeFilterState(v); setPageState(1) },
    reviewOnly,
    setReviewOnly: (v) => { setReviewOnlyState(v); setPageState(1) },
    // sort
    sortField,
    sortDirection,
    toggleSort,
    // pagination
    resultCount: sorted.length,
    pageItems,
    page: currentPage,
    totalPages,
    pageSize,
    setPage: setPageState,
    setPageSize: (n) => { setPageSizeState(n); setPageState(1) },
  }
}
