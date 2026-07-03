import { useState, useEffect, useCallback } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

export function usePagination(totalCount: number, pageSize: number) {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(totalCount / pageSize)

  const goToPage = useCallback((p: number) => {
    setPage(Math.max(0, Math.min(p, totalPages - 1)))
  }, [totalPages])

  const nextPage = useCallback(() => goToPage(page + 1), [page, goToPage])
  const prevPage = useCallback(() => goToPage(page - 1), [page, goToPage])

  return { page, totalPages, goToPage, nextPage, prevPage, isFirst: page === 0, isLast: page >= totalPages - 1 }
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value: T) => {
    setStoredValue(value)
    localStorage.setItem(key, JSON.stringify(value))
  }, [key])

  return [storedValue, setValue]
}
