import React from 'react'
import { classNames } from '@/utils/formatters'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={classNames('animate-pulse bg-gray-200 rounded-lg', className)} />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-6 max-w-xs">{description}</p>}
      {action}
    </div>
  )
}

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message = 'Something went wrong.', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
        <span className="text-2xl">⚠️</span>
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">Error</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

interface PaginationProps {
  page: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
  isFirst: boolean
  isLast: boolean
  totalCount: number
  pageSize: number
}

export function Pagination({ page, totalPages, onPrev, onNext, isFirst, isLast, totalCount, pageSize }: PaginationProps) {
  const from = page * pageSize + 1
  const to = Math.min((page + 1) * pageSize, totalCount)
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <p className="text-sm text-gray-600">
        Showing <span className="font-medium">{from}–{to}</span> of <span className="font-medium">{totalCount}</span> results
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={isFirst}
          className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600 px-2">
          {page + 1} / {totalPages}
        </span>
        <button
          onClick={onNext}
          disabled={isLast}
          className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  )
}
