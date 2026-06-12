import React from 'react'

const VARIANTS = {
  default:  'bg-gray-100 text-gray-700',
  success:  'bg-emerald-50 text-emerald-700',
  warning:  'bg-amber-50 text-amber-700',
  danger:   'bg-red-50 text-red-700',
  info:     'bg-indigo-50 text-indigo-700',
}

export default function Badge({ children, variant = 'default' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANTS[variant] ?? VARIANTS.default}`}
    >
      {children}
    </span>
  )
}
