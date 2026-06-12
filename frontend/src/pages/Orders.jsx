import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Eye, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import useStore from '../store/useStore'
import PageHeader from '../components/shared/PageHeader'
import Button from '../components/shared/Button'
import EmptyState from '../components/shared/EmptyState'
import TableSkeleton from '../components/shared/TableSkeleton'
import ConfirmDialog from '../components/shared/ConfirmDialog'
import CreateOrderModal from '../components/orders/CreateOrderModal'
import { extractError } from '../utils/errorHandler'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export default function Orders() {
  const { orders, ordersLoading, fetchOrders, customers, fetchCustomers, removeOrder } = useStore()

  const [showCreate, setShowCreate]     = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting]         = useState(false)

  useEffect(() => {
    fetchOrders()
    fetchCustomers()
  }, [fetchOrders, fetchCustomers])

  function getCustomerName(customerId) {
    const c = customers.find((c) => String(c.id) === String(customerId))
    return c?.name ?? '—'
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await removeOrder(deleteTarget.id)
      toast.success(`Order #${deleteTarget.id} deleted.`)
      setDeleteTarget(null)
    } catch (err) {
      const errorMessage = extractError(err, 'Failed to delete order.')
      toast.error(errorMessage)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Orders"
        description="Track and manage all customer orders."
        action={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            Create Order
          </Button>
        }
      />

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="sticky top-0 px-6 py-3">Order ID</th>
                <th className="sticky top-0 px-6 py-3">Customer</th>
                <th className="sticky top-0 px-6 py-3">Total Amount</th>
                <th className="sticky top-0 px-6 py-3">Date</th>
                <th className="sticky top-0 px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            {ordersLoading ? (
              <TableSkeleton rows={6} cols={5} />
            ) : (
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState
                        title="No orders yet"
                        description="Create your first order to get started."
                        action={
                          <Button size="sm" onClick={() => setShowCreate(true)}>
                            <Plus className="h-3.5 w-3.5" />
                            Create Order
                          </Button>
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-t border-gray-100 transition-colors hover:bg-gray-50"
                    >
                      <td className="px-6 py-3 font-mono text-xs font-semibold text-gray-700">
                        #{String(order.id).padStart(4, '0')}
                      </td>
                      <td className="px-6 py-3 font-medium text-gray-900">
                        {order.customerName ?? getCustomerName(order.customerId)}
                      </td>
                      <td className="px-6 py-3 font-semibold text-gray-900">
                        ${Number(order.total ?? order.totalAmount ?? 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {formatDate(order.createdAt ?? order.date)}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/orders/${order.id}`}>
                            <Button variant="ghost" size="icon" title="View details">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(order)}
                            title="Delete order"
                            className="text-red-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            )}
          </table>
        </div>
      </div>

      <CreateOrderModal open={showCreate} onClose={() => setShowCreate(false)} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete order?"
        description={`Are you sure you want to delete Order #${String(deleteTarget?.id ?? '').padStart(4, '0')}? This cannot be undone.`}
        loading={deleting}
      />
    </>
  )
}
