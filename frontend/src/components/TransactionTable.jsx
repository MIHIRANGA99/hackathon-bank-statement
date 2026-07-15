import { useState } from 'react'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CATEGORIES } from '@/lib/categorization/categories'

const COLUMNS = [
  { field: 'select', label: '', sortable: false },
  { field: 'date', label: 'Date' },
  { field: 'description', label: 'Description' },
  { field: 'category', label: 'Category' },
  { field: 'debit', label: 'Debit', align: 'right' },
  { field: 'credit', label: 'Credit', align: 'right' },
  { field: 'balance', label: 'Balance', align: 'right' },
  { field: 'reference', label: 'Reference', sortable: false },
]

function formatAmount(value) {
  return value != null ? value.toFixed(2) : ''
}

function categoryBadgeVariant(t) {
  if (t.needsReview) return 'outline'
  if (t.category === 'Other' || t.category === 'Uncategorized') return 'secondary'
  return 'default'
}

export function TransactionTable({ repo, onUpdateCategory, onBulkUpdateCategory }) {
  const [selected, setSelected] = useState(() => new Set())
  const [bulkCategory, setBulkCategory] = useState(CATEGORIES[0])

  const pageIds = repo.pageItems.map((t) => t.id)
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id))

  function toggleRow(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAllOnPage() {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allOnPageSelected) {
        pageIds.forEach((id) => next.delete(id))
      } else {
        pageIds.forEach((id) => next.add(id))
      }
      return next
    })
  }

  function applyBulkUpdate() {
    if (selected.size === 0) return
    onBulkUpdateCategory(Array.from(selected), bulkCategory)
    setSelected(new Set())
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search description, reference, category…"
          value={repo.search}
          onChange={(e) => repo.setSearch(e.target.value)}
          className="max-w-xs"
        />

        <Select value={repo.categoryFilter} onValueChange={repo.setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category">
              {(value) => (value === 'all' ? 'All categories' : value)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {repo.categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={repo.typeFilter} onValueChange={repo.setTypeFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Type">
              {(value) =>
                value === 'all' ? 'All types' : value === 'debit' ? 'Debit only' : 'Credit only'
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="debit">Debit only</SelectItem>
            <SelectItem value="credit">Credit only</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant={repo.reviewOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => repo.setReviewOnly(!repo.reviewOnly)}
        >
          Needs review only
        </Button>

        <span className="ml-auto text-sm text-muted-foreground">
          {repo.resultCount} of {repo.total} transactions
        </span>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
          <span className="text-sm">{selected.size} selected</span>
          <Select value={bulkCategory} onValueChange={setBulkCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" size="sm" onClick={applyBulkUpdate}>
            Apply to selected
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
            Clear selection
          </Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {COLUMNS.map((col) => {
                if (col.field === 'select') {
                  return (
                    <TableHead key="select" className="w-10">
                      <input
                        type="checkbox"
                        checked={allOnPageSelected}
                        onChange={toggleAllOnPage}
                        aria-label="Select all on page"
                      />
                    </TableHead>
                  )
                }

                const isSortable = col.sortable !== false
                const isActive = repo.sortField === col.field
                const Icon = isActive
                  ? repo.sortDirection === 'asc'
                    ? ArrowUp
                    : ArrowDown
                  : ArrowUpDown

                return (
                  <TableHead
                    key={col.field}
                    className={col.align === 'right' ? 'text-right' : undefined}
                  >
                    {isSortable ? (
                      <button
                        type="button"
                        onClick={() => repo.toggleSort(col.field)}
                        className="inline-flex items-center gap-1 hover:text-foreground"
                      >
                        {col.label}
                        <Icon className={`size-3.5 ${isActive ? '' : 'opacity-40'}`} />
                      </button>
                    ) : (
                      col.label
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {repo.pageItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={COLUMNS.length} className="py-8 text-center text-muted-foreground">
                  No transactions match your search/filters.
                </TableCell>
              </TableRow>
            )}
            {repo.pageItems.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selected.has(t.id)}
                    onChange={() => toggleRow(t.id)}
                    aria-label={`Select transaction ${t.id}`}
                  />
                </TableCell>
                <TableCell>{t.date}</TableCell>
                <TableCell>{t.description}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Select value={t.category} onValueChange={(v) => onUpdateCategory(t.id, v)}>
                      <SelectTrigger className="h-7 w-36 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {t.needsReview && (
                      <Badge variant={categoryBadgeVariant(t)} className="text-[0.65rem]">
                        {t.confidence}%
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">{formatAmount(t.debit)}</TableCell>
                <TableCell className="text-right">{formatAmount(t.credit)}</TableCell>
                <TableCell className="text-right">{formatAmount(t.balance)}</TableCell>
                <TableCell>{t.reference}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          Rows per page
          <Select value={String(repo.pageSize)} onValueChange={(v) => repo.setPageSize(Number(v))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={repo.page <= 1}
            onClick={() => repo.setPage(repo.page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {repo.page} of {repo.totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={repo.page >= repo.totalPages}
            onClick={() => repo.setPage(repo.page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
