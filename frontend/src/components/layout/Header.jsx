import React from 'react'
import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/products':  'Products',
  '/customers': 'Customers',
  '/orders':    'Orders',
}

function getTitle(pathname) {
  if (pathname.startsWith('/orders/')) return 'Order Details'
  return PAGE_TITLES[pathname] ?? 'Inventory & Order Management'
}

export default function Header({ onMenuClick }) {
  const { pathname } = useLocation()

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-base font-semibold text-gray-900">
            {getTitle(pathname)}
          </h1>
          <p className="hidden text-xs text-gray-400 sm:block">
            Inventory &amp; Order Management System
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
          A
        </div>
      </div>
    </header>
  )
}
