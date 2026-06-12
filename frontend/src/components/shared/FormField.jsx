import React from 'react'

export default function FormField({ label, error, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}

export function Input({ error, className = '', ...props }) {
  return (
    <input
      className={[
        'h-9 w-full rounded-lg border px-3 text-sm transition-colors',
        'placeholder:text-gray-400',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 focus:border-indigo-500',
        error
          ? 'border-red-400 bg-red-50 text-red-900'
          : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400',
        className,
      ].join(' ')}
      {...props}
    />
  )
}

export function Select({ error, className = '', children, ...props }) {
  return (
    <select
      className={[
        'h-9 w-full rounded-lg border px-3 text-sm transition-colors appearance-none cursor-pointer',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 focus:border-indigo-500',
        error
          ? 'border-red-400 bg-red-50 text-red-900'
          : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </select>
  )
}
