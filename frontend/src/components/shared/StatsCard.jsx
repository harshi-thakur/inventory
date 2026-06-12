import React from 'react'

export default function StatsCard({ label, value, icon: Icon, iconBg = 'bg-indigo-100', iconColor = 'text-indigo-600', loading = false }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {loading ? (
        <div className="flex flex-col gap-3">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
        </div>
      ) : (
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
            <p className="mt-1.5 text-3xl font-bold text-gray-900">{value ?? '—'}</p>
          </div>
          {Icon && (
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
