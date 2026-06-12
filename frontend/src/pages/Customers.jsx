import React, { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import useStore from '../store/useStore'
import PageHeader from '../components/shared/PageHeader'
import Button from '../components/shared/Button'
import EmptyState from '../components/shared/EmptyState'
import TableSkeleton from '../components/shared/TableSkeleton'
import ConfirmDialog from '../components/shared/ConfirmDialog'
import CustomerFormModal from '../components/customers/CustomerFormModal'
import { extractError } from '../utils/errorHandler'

function initials(name = '') {
  return name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase()).join('')
}

export default function Customers() {
  const { customers, customersLoading, fetchCustomers, removeCustomer } = useStore()

  const [showForm, setShowForm]         = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting]         = useState(false)

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await removeCustomer(deleteTarget.id)
      toast.success(`"${deleteTarget.name}" removed.`)
      setDeleteTarget(null)
    } catch (err) {
      const errorMessage = extractError(err, 'Failed to delete customer.')
      toast.error(errorMessage)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Customers"
        description="Manage your customer accounts."
        action={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        }
      />

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="sticky top-0 px-6 py-3">Customer</th>
                <th className="sticky top-0 px-6 py-3">Email</th>
                <th className="sticky top-0 px-6 py-3">Phone</th>
                <th className="sticky top-0 px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            {customersLoading ? (
              <TableSkeleton rows={5} cols={4} />
            ) : (
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <EmptyState
                        title="No customers yet"
                        description="Add your first customer to get started."
                        action={
                          <Button size="sm" onClick={() => setShowForm(true)}>
                            <Plus className="h-3.5 w-3.5" />
                            Add Customer
                          </Button>
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-t border-gray-100 transition-colors hover:bg-gray-50"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                            {initials(customer.name)}
                          </div>
                          <span className="font-medium text-gray-900">{customer.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        <a href={`mailto:${customer.email}`} className="hover:text-indigo-600 hover:underline">
                          {customer.email}
                        </a>
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        <a href={`tel:${customer.phone}`} className="hover:text-indigo-600 hover:underline">
                          {customer.phone}
                        </a>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(customer)}
                            title="Delete customer"
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

      <CustomerFormModal open={showForm} onClose={() => setShowForm(false)} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete customer?"
        description={`Are you sure you want to remove "${deleteTarget?.name}"? This cannot be undone.`}
        loading={deleting}
      />
    </>
  )
}
