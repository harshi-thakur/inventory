import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import Modal from '../shared/Modal'
import Button from '../shared/Button'
import FormField, { Select, Input } from '../shared/FormField'
import useStore from '../../store/useStore'
import { extractError } from '../../utils/errorHandler'

function newItem() {
  return { id: crypto.randomUUID(), productId: '', quantity: 1 }
}

function getCurrentDateTimeLocal() {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  const local = new Date(now.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

export default function CreateOrderModal({ open, onClose }) {
  const { customers, products, addOrder, fetchCustomers, fetchProducts } = useStore()

  const [customerId, setCustomerId] = useState('')
  const [orderDateTime, setOrderDateTime] = useState(getCurrentDateTimeLocal())
  const [items, setItems] = useState([newItem()])
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      fetchCustomers()
      fetchProducts()
      setCustomerId('')
      setOrderDateTime(getCurrentDateTimeLocal())
      setItems([newItem()])
      setErrors({})
    }
  }, [open, fetchCustomers, fetchProducts])

  function validate() {
    const errs = {}
    if (!customerId) errs.customerId = 'Please select a customer.'
    items.forEach((item, i) => {
      if (!item.productId) errs[`product_${i}`] = 'Select a product.'
      else if (Number(item.quantity) < 1) errs[`qty_${i}`] = 'Quantity must be at least 1.'
    })
    return errs
  }

  function setItemField(id, field, value) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, [field]: field === 'productId' ? value : value }
          : item
      )
    )
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  function addItem() {
    // Check for duplicate prevention
    setItems((prev) => [...prev, newItem()])
  }

  function getSelectedProductIds() {
    return items.map((i) => i.productId).filter(Boolean)
  }

  function getProduct(productId) {
    return products.find((p) => String(p.id) === String(productId))
  }

  function calcSubtotal(item) {
    const product = getProduct(item.productId)
    if (!product) return 0
    return Number(product.price) * Number(item.quantity)
  }

  const orderTotal = items.reduce((sum, item) => sum + calcSubtotal(item), 0)
  const totalQty   = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const payload = {
      customerId: customerId,
      items: items
        .filter((item) => item.productId) // Only include items with a product selected
        .map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
        })),
    }

    setSaving(true)
    try {
      await addOrder(payload)
      toast.success('Order created successfully.')
      onClose()
    } catch (err) {
      const errorMessage = extractError(err, 'Failed to create order.')
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Order" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

        {/* Order date/time */}
        <FormField label="Order Date & Time">
          <Input value={orderDateTime} readOnly />
        </FormField>

        {/* Customer selection */}
        <FormField label="Customer" required error={errors.customerId}>
          <Select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            error={errors.customerId}
          >
            <option value="">Select a customer…</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </FormField>

        {/* Order items */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">Order Items</p>
            <Button type="button" variant="secondary" size="sm" onClick={addItem}>
              <Plus className="h-3.5 w-3.5" />
              Add Product
            </Button>
          </div>

          <div className="rounded-lg border border-gray-200 overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_120px_90px_90px_32px] gap-2 bg-gray-50 px-3 py-2 text-xs font-medium uppercase tracking-wide text-gray-500">
              <span>Product</span>
              <span>Stock / Price</span>
              <span>Qty</span>
              <span>Subtotal</span>
              <span />
            </div>

            <div className="divide-y divide-gray-100">
              {items.map((item, idx) => {
                const product = getProduct(item.productId)
                const usedIds = getSelectedProductIds().filter((pid) => pid !== item.productId)
                const availableProducts = products.filter(
                  (p) => !usedIds.includes(String(p.id))
                )
                const subtotal = calcSubtotal(item)

                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr_120px_90px_90px_32px] gap-2 items-center px-3 py-2.5"
                  >
                    {/* Product picker */}
                    <div className="flex flex-col gap-0.5">
                      <Select
                        value={item.productId}
                        onChange={(e) => setItemField(item.id, 'productId', e.target.value)}
                        error={errors[`product_${idx}`]}
                      >
                        <option value="">Select…</option>
                        {availableProducts.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </Select>
                      {errors[`product_${idx}`] && (
                        <p className="text-xs text-red-600">{errors[`product_${idx}`]}</p>
                      )}
                    </div>

                    {/* Stock + price info */}
                    <div className="flex flex-col text-xs">
                      {product ? (
                        <>
                          <span className="text-gray-500">Stock: <strong className="text-gray-700">{product.quantity}</strong></span>
                          <span className="text-gray-500">Price: <strong className="text-gray-700">${Number(product.price).toFixed(2)}</strong></span>
                        </>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="flex flex-col gap-0.5">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => setItemField(item.id, 'quantity', e.target.value)}
                        error={errors[`qty_${idx}`]}
                      />
                      {errors[`qty_${idx}`] && (
                        <p className="text-xs text-red-600">{errors[`qty_${idx}`]}</p>
                      )}
                    </div>

                    {/* Subtotal */}
                    <div className="text-sm font-medium text-gray-900 text-right">
                      ${subtotal.toFixed(2)}
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Order summary card */}
        <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 mb-2">Order Summary</p>
          <div className="flex justify-between text-sm text-gray-700">
            <span>Products</span>
            <span className="font-medium">{items.filter((i) => i.productId).length}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-700 mt-1">
            <span>Total Quantity</span>
            <span className="font-medium">{totalQty}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-indigo-200 pt-2 text-sm font-semibold text-gray-900">
            <span>Total Amount</span>
            <span className="text-indigo-700">${orderTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" type="button" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Create Order
          </Button>
        </div>
      </form>
    </Modal>
  )
}
