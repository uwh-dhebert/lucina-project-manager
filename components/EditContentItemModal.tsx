'use client'

import { useState, useRef, useEffect } from 'react'

interface EditContentItemModalProps {
  isOpen: boolean
  contentItemId: string
  contentItemTitle?: string
  contentItemContent: string
  onClose: () => void
  onSuccess: () => void
  onDelete: () => void
}

export function EditContentItemModal({
  isOpen,
  contentItemId,
  contentItemTitle,
  contentItemContent,
  onClose,
  onSuccess,
  onDelete,
}: EditContentItemModalProps) {
  const [title, setTitle] = useState(contentItemTitle || '')
  const [content, setContent] = useState(contentItemContent)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    setTitle(contentItemTitle || '')
    setContent(contentItemContent)
  }, [contentItemTitle, contentItemContent])

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal()
    } else {
      dialogRef.current?.close()
    }
  }, [isOpen])

  const handleClose = () => {
    setError('')
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/wiki/content/${contentItemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title || undefined, content }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update content')
      }

      handleClose()
      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this content item?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/wiki/content/${contentItemId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        handleClose()
        onDelete()
      }
    } catch (err) {
      setError('Failed to delete content')
    } finally {
      setLoading(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="backdrop:bg-black/70 rounded-2xl shadow-2xl max-w-2xl w-full p-6 bg-slate-800 border border-slate-700"
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Edit Content</h2>
          <p className="text-slate-400 text-sm mt-1">Update content item details</p>
        </div>

        {error && (
          <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Overview, Installation"
              className="w-full px-4 py-2 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-700 text-white placeholder-slate-500"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your content here..."
              rows={10}
              className="w-full px-4 py-2 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-700 text-white placeholder-slate-500 resize-none"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 border border-slate-600 text-slate-300 font-medium rounded-full hover:bg-slate-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          className="w-full px-4 py-2.5 border border-red-700 text-red-400 font-medium rounded-full hover:bg-red-900/20 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          🗑️ Delete Content
        </button>
      </form>
    </dialog>
  )
}

