import React from 'react'
import { classNames } from '@/utils/formatters'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
type Size = 'sm' | 'md' | 'lg'

const VARIANT_MAP: Record<Variant, string> = {
  primary:   'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  danger:    'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  ghost:     'text-gray-600 hover:bg-gray-100',
  outline:   'border border-gray-300 text-gray-700 hover:bg-gray-50',
}

const SIZE_MAP: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}

export function Button({
  variant = 'primary', size = 'md', loading = false,
  icon, children, className, disabled, ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={classNames(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANT_MAP[variant],
        SIZE_MAP[size],
        className
      )}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  )
}
