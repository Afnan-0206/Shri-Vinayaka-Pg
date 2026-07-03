import React from 'react'
import { classNames } from '@/utils/formatters'

type BadgeColor = 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'gray' | 'orange'

const COLOR_MAP: Record<BadgeColor, string> = {
  green:  'bg-green-100 text-green-800 border-green-200',
  red:    'bg-red-100 text-red-800 border-red-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  blue:   'bg-blue-100 text-blue-800 border-blue-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  gray:   'bg-gray-100 text-gray-700 border-gray-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200',
}

interface BadgeProps {
  label: string
  color?: BadgeColor
  dot?: boolean
  className?: string
}

export function Badge({ label, color = 'gray', dot = false, className }: BadgeProps) {
  return (
    <span className={classNames(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
      COLOR_MAP[color],
      className
    )}>
      {dot && (
        <span className={classNames('w-1.5 h-1.5 rounded-full', {
          green: 'bg-green-500', red: 'bg-red-500', yellow: 'bg-yellow-500',
          blue: 'bg-blue-500', purple: 'bg-purple-500', gray: 'bg-gray-400',
          orange: 'bg-orange-500',
        }[color])} />
      )}
      {label}
    </span>
  )
}
