import React, { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import useStore from '../store/useStore'
import PageHeader from '../components/shared/PageHeader'
import Button from '../components/shared/Button'
import Badge from '../components/shared/Badge'
import EmptyState from '../components/shared/EmptyState'
import TableSkeleton from '../components/shared/TableSkeleton'
import ConfirmDialog from '../components/shared/ConfirmDialog'
import ProductFormModal from '../components/products/ProductFormModal'
import { extractError } from '../utils/errorHandler'

function getStockBadge(qty) {
  if (qty < 5)  return <Badge variant="danger">Critical</Badge>
  if (qty < 10) return <Badge variant="warning">Low</Badge>
  return <Badge variant="success">OK</Badge>
}

export default function Products() {
  const { products, productsLoading, fetchProducts, removeProduct } = useStore()

  const [showForm, setShowForm]     = useState(false)
  const [editing, setEditing]       = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting]     = useState(false)

  useEffect(() => { fetchProducts() }, [fetchProducts])

  function openAdd() { setEditing(null); setShowForm(true) }
  function openEdit(p) { setEditing(p); setShowForm(true) }
  function closeForm() { setShowForm(false); setEditing(null) }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await removeProduct(deleteTarget.id)
      toast.success(`"${deleteTarget.name}" deleted.`)
      setDeleteTarget(null)
    } catch (err) {
      const errorMessage = extractError(err, 'Failed to delete product.')
      toast.error(errorMessage)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Products"
        description="Manage your product catalogue and stock levels."
        action={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        }
      />

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="sticky top-0 px-6 py-3">Product Name</th>
                <th className="sticky top-0 px-6 py-3">SKU</th>
                <th className="sticky top-0 px-6 py-3">Price</th>
                <th className="sticky top-0 px-6 py-3">Qty in Stock</th>
                <th className="sticky top-0 px-6 py-3">Status</th>
                <th className="sticky top-0 px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            {productsLoading ? (
              <TableSkeleton rows={6} cols={6} />
            ) : (
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        title="No products yet"
                        description="Add your first product to get started."
                        action={
                          <Button size="sm" onClick={openAdd}>
                            <Plus className="h-3.5 w-3.5" />
                            Add Product
                          </Button>
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-t border-gray-100 transition-colors hover:bg-gray-50"
                    >
                      <td className="px-6 py-3 font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-3 font-mono text-xs text-gray-600">
                        {product.sku}
                      </td>
                      <td className="px-6 py-3 text-gray-700">
                        ${Number(product.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-3 text-gray-700">
                        {product.quantity}
                      </td>
                      <td className="px-6 py-3">
                        {getStockBadge(product.quantity)}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(product)}
                            title="Edit product"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(product)}
                            title="Delete product"
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

      <ProductFormModal open={showForm} onClose={closeForm} product={editing} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete product?"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        loading={deleting}
      />
    </>
  )
}
