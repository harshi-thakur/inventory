import React from 'react'
import Modal from './Modal'
import Button from './Button'
import { TriangleAlert } from 'lucide-react'

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', description, loading = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
            <TriangleAlert className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            {description ?? 'This action cannot be undone.'}
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  )
}
