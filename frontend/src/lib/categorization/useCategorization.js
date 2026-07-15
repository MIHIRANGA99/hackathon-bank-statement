import { useEffect, useMemo, useState } from 'react'
import { categorizeTransactions, updateTransactionCategory } from './api'

function normalizeDescription(description) {
  return String(description || '').trim().toLowerCase()
}

// Session-scoped categorization layer on top of Module 1's parsed
// transactions. Runs the hybrid rule/AI categorization once per loaded
// statement (the backend persists the result to MongoDB), then layers
// manual overrides and session-learned corrections (Feature 3.8: a manual
// correction is remembered for the rest of the session and auto-applied to
// any other transaction with the same description) on top in local state
// for instant UI feedback, while each manual correction is also persisted.
export function useCategorization(rawTransactions, sourceFileName) {
  const [baseResults, setBaseResults] = useState({}) // index -> {category, confidence, source, needsReview, transactionId}
  const [overrides, setOverrides] = useState({}) // index -> category
  const [learned, setLearned] = useState({}) // normalized description -> category (persists across statements this session)
  const [auditTrail, setAuditTrail] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!rawTransactions || rawTransactions.length === 0) {
      setBaseResults({})
      return
    }

    let cancelled = false
    setIsLoading(true)
    setOverrides({})

    categorizeTransactions(rawTransactions, sourceFileName)
      .then((results) => {
        if (cancelled) return
        const byIndex = {}
        for (const r of results) {
          byIndex[r.id] = {
            category: r.category,
            confidence: r.confidence,
            source: r.source,
            needsReview: r.needsReview,
            transactionId: r.transactionId,
          }
        }
        setBaseResults(byIndex)
      })
      .catch(() => {
        if (cancelled) return
        const byIndex = {}
        rawTransactions.forEach((_, i) => {
          byIndex[i] = { category: 'Other', confidence: 0, source: 'error', needsReview: true, transactionId: null }
        })
        setBaseResults(byIndex)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawTransactions])

  const categorizedTransactions = useMemo(() => {
    return (rawTransactions || []).map((t, i) => {
      const override = overrides[i]
      const base = baseResults[i]

      if (override) {
        return { ...t, category: override, confidence: 100, source: 'user', needsReview: false, transactionId: base?.transactionId }
      }

      const learnedCategory = learned[normalizeDescription(t.description)]
      if (learnedCategory) {
        return { ...t, category: learnedCategory, confidence: 100, source: 'learned', needsReview: false, transactionId: base?.transactionId }
      }

      if (base) return { ...t, ...base }

      return { ...t, category: 'Uncategorized', confidence: 0, source: 'pending', needsReview: false }
    })
  }, [rawTransactions, baseResults, overrides, learned])

  function updateCategory(index, newCategory) {
    const t = rawTransactions[index]
    const current = categorizedTransactions[index]
    if (!t || current.category === newCategory) return

    setOverrides((prev) => ({ ...prev, [index]: newCategory }))
    setLearned((prev) => ({ ...prev, [normalizeDescription(t.description)]: newCategory }))
    setAuditTrail((prev) => [
      ...prev,
      {
        transactionId: index,
        description: t.description,
        originalCategory: current.category,
        updatedCategory: newCategory,
        modifiedByUser: true,
        modifiedDate: new Date().toISOString(),
      },
    ])

    // Persist in the background — local state above already gives instant
    // UI feedback regardless of whether this succeeds.
    if (current.transactionId) {
      updateTransactionCategory(current.transactionId, newCategory).catch(() => {})
    }
  }

  function bulkUpdateCategory(indices, newCategory) {
    indices.forEach((i) => updateCategory(i, newCategory))
  }

  const summary = useMemo(() => {
    const total = categorizedTransactions.length
    const needsReview = categorizedTransactions.filter((t) => t.needsReview).length
    const userCorrected = new Set(auditTrail.map((a) => a.transactionId)).size
    const autoCategorized = total - needsReview
    return { total, autoCategorized, needsReview, userCorrected }
  }, [categorizedTransactions, auditTrail])

  return {
    categorizedTransactions,
    isLoading,
    updateCategory,
    bulkUpdateCategory,
    auditTrail,
    summary,
  }
}
