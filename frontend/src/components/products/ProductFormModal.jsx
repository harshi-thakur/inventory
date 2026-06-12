import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import Modal from '../shared/Modal'
import Button from '../shared/Button'
import FormField, { Input } from '../shared/FormField'
import useStore from '../../store/useStore'
import { extractError } from '../../utils/errorHandler'

const EMPTY = { name: '', sku: '', price: '', quantity: '' }

function validate(form) {
  const errors = {}
  if (!form.name.trim())       errors.name     = 'Product name is required.'
  if (!form.sku.trim())        errors.sku      = 'SKU is required.'
  if (form.price === '')       errors.price    = 'Price is required.'
  else if (Number(form.price) <= 0) errors.price = 'Price must be greater than zero.'
  if (form.quantity === '')    errors.quantity = 'Quantity is required.'
  else if (Number(form.quantity) < 0) errors.quantity = 'Quantity cannot be negative.'
  return errors
}

export default function ProductFormModal({ open, onClose, product = null }) {
  const { addProduct, editProduct } = useStore()
  const isEdit = Boolean(product)

  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(
        product
          ? { name: product.name, sku: product.sku, price: String(product.price), quantity: String(product.quantity) }
          : EMPTY
      )
      setErrors({})
    }
  }, [open, product])

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity, 10),
    }

    setSaving(true)
    try {
      if (isEdit) {
        await editProduct(product.id, payload)
        toast.success('Product updated successfully.')
      } else {
        await addProduct(payload)
        toast.success('Product added successfully.')
      }
      onClose()
    } catch (err) {
      const errorMessage = extractError(err, 'Failed to save product.')
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Product' : 'Add Product'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <FormField label="Product Name" required error={errors.name}>
          <Input
            value={form.name}
            onChange={set('name')}
            placeholder="e.g. Running Shoes"
            error={errors.name}
          />
        </FormField>

        <FormField label="SKU" required error={errors.sku}>
          <Input
            value={form.sku}
            onChange={set('sku')}
            placeholder="e.g. SKU-001"
            error={errors.sku}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Price ($)" required error={errors.price}>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={form.price}
              onChange={set('price')}
              placeholder="0.00"
              error={errors.price}
            />
          </FormField>
          <FormField label="Quantity" required error={errors.quantity}>
            <Input
              type="number"
              min="0"
              step="1"
              value={form.quantity}
              onChange={set('quantity')}
              placeholder="0"
              error={errors.quantity}
            />
          </FormField>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {isEdit ? 'Save Changes' : 'Add Product'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
