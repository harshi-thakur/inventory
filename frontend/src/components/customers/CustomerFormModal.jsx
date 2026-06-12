import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import Modal from '../shared/Modal'
import Button from '../shared/Button'
import FormField, { Input } from '../shared/FormField'
import useStore from '../../store/useStore'
import { extractError } from '../../utils/errorHandler'

const EMPTY = { name: '', email: '', phone: '' }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(form) {
  const errors = {}
  if (!form.name.trim())  errors.name  = 'Full name is required.'
  if (!form.email.trim()) errors.email = 'Email address is required.'
  else if (!EMAIL_RE.test(form.email)) errors.email = 'Enter a valid email address.'
  if (!form.phone.trim()) errors.phone = 'Phone number is required.'
  return errors
}

export default function CustomerFormModal({ open, onClose }) {
  const { addCustomer } = useStore()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) { setForm(EMPTY); setErrors({}) }
  }, [open])

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      await addCustomer({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
      })
      toast.success('Customer added successfully.')
      onClose()
    } catch (err) {
      const errorMessage = extractError(err, 'Failed to add customer.')
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Customer">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <FormField label="Full Name" required error={errors.name}>
          <Input
            value={form.name}
            onChange={set('name')}
            placeholder="e.g. Jane Smith"
            error={errors.name}
          />
        </FormField>

        <FormField label="Email Address" required error={errors.email}>
          <Input
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="jane@example.com"
            error={errors.email}
          />
        </FormField>

        <FormField label="Phone Number" required error={errors.phone}>
          <Input
            type="tel"
            value={form.phone}
            onChange={set('phone')}
            placeholder="+1 (555) 000-0000"
            error={errors.phone}
          />
        </FormField>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Add Customer
          </Button>
        </div>
      </form>
    </Modal>
  )
}
