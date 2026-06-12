import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import useStore from '../store/useStore'
import { extractError } from '../utils/errorHandler'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:items-center py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  )
}

export default function OrderDetails() {
  const { id } = useParams()
  const { fetchOrder } = useStore()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchOrder(id)
      .then((data) => { if (!cancelled) setOrder(data) })
      .catch((err) => { 
        if (!cancelled) {
          const errorMessage = extractError(err, 'Order not found.')
          setError(errorMessage)
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id, fetchOrder])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <p className="text-sm text-red-600 font-medium">{error ?? 'Order not found.'}</p>
        <Link to="/orders" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
      </div>
    )
  }

  const items = order.items ?? order.orderItems ?? []
  const totalQty = items.reduce((s, i) => s + Number(i.quantity || 0), 0)
  const grandTotal = items.reduce(
    (s, i) => s + Number(i.quantity || 0) * Number(i.unitPrice || i.price || 0),
    0
  )

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Back link */}
      <div>
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-gray-900">
          Order #{String(order.id).padStart(4, '0')}
        </h2>
        <p className="text-sm text-gray-500">
          Placed on {formatDate(order.createdAt ?? order.date)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Order Info */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Information</h3>
          <InfoRow label="Order ID" value={`#${String(order.id).padStart(4, '0')}`} />
          <InfoRow label="Order Date" value={formatDate(order.createdAt ?? order.date)} />
          <InfoRow label="Total Amount" value={`$${Number(order.total ?? order.totalAmount ?? grandTotal).toFixed(2)}`} />
        </div>

        {/* Customer Info */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer Information</h3>
          <InfoRow label="Name" value={order.customerName ?? order.customer?.name ?? '—'} />
          <InfoRow label="Email" value={order.customerEmail ?? order.customer?.email ?? '—'} />
          <InfoRow label="Phone" value={order.customerPhone ?? order.customer?.phone ?? '—'} />
        </div>
      </div>

      {/* Order Items Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-900">Order Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3">Product Name</th>
                <th className="px-6 py-3">Quantity</th>
                <th className="px-6 py-3">Unit Price</th>
                <th className="px-6 py-3 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400">
                    No items found.
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => {
                  const unitPrice = Number(item.unitPrice ?? item.price ?? 0)
                  const lineTotal = Number(item.quantity) * unitPrice
                  return (
                    <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 font-medium text-gray-900">
                        {item.productName ?? item.product?.name ?? `Product #${item.productId}`}
                      </td>
                      <td className="px-6 py-3 text-gray-700">{item.quantity}</td>
                      <td className="px-6 py-3 text-gray-700">${unitPrice.toFixed(2)}</td>
                      <td className="px-6 py-3 text-right font-semibold text-gray-900">
                        ${lineTotal.toFixed(2)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary footer */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-indigo-600 mb-3">Order Summary</h3>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-6 text-sm text-gray-600">
            <span>Products: <strong className="text-gray-900">{items.length}</strong></span>
            <span>Total Qty: <strong className="text-gray-900">{totalQty}</strong></span>
          </div>
          <div className="text-lg font-bold text-indigo-700">
            Grand Total: ${Number(order.total ?? order.totalAmount ?? grandTotal).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  )
}
