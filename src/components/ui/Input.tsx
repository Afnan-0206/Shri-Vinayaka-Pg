import React from 'react'
import { classNames } from '@/utils/formatters'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
}

export function Input({ label, error, hint, leftIcon, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '_')
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          {...props}
          className={classNames(
            'w-full rounded-lg border px-3 py-2 text-sm transition-colors outline-none',
            'border-gray-300 bg-white text-gray-900 placeholder-gray-400',
            'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20',
            'disabled:bg-gray-50 disabled:text-gray-500',
            error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : '',
            leftIcon ? 'pl-10' : '',
            className
          )}
        />
      </div>
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export function Select({ label, error, options, placeholder, className, id, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '_')
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        id={inputId}
        {...props}
        className={classNames(
          'w-full rounded-lg border px-3 py-2 text-sm transition-colors outline-none',
          'border-gray-300 bg-white text-gray-900',
          'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20',
          'disabled:bg-gray-50 disabled:text-gray-500',
          error ? 'border-red-400' : '',
          className
        )}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function TextArea({ label, error, className, id, ...props }: TextAreaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '_')
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        {...props}
        className={classNames(
          'w-full rounded-lg border px-3 py-2 text-sm transition-colors outline-none resize-none',
          'border-gray-300 bg-white text-gray-900 placeholder-gray-400',
          'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20',
          error ? 'border-red-400' : '',
          className
        )}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
