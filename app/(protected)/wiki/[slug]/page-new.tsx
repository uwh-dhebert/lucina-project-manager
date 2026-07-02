'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CreateSubjectModal } from '@/components/CreateSubjectModal'

interface ContentItem {
  id: string
  title?: string
  content: string
  order: number
}

interface Subject {
  id: string
  topicId: string
  title: string
  slug: string
  order: number
  contentItems?: ContentItem[]
}

interface Topic {
  id: string
  title: string
  slug: string
  order: number
  createdAt: string
  updatedAt: string
  subjects?: Subject[]
}

export default function TopicDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [topic, setTopic] = useState<Topic | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [createSubjectModalOpen, setCreateSubjectModalOpen] = useState(false)

  useEffect(() => {
    loadTopic()
  }, [slug])

  const loadTopic = async () => {
    try {
      const response = await fetch('/api/wiki')
      if (response.ok) {
        const topics = await response.json()
        const found = topics.find((t: Topic) => t.slug === slug)
        if (found) {
          setTopic(found)
        } else {
          setError('Topic not found')
        }
      }
    } catch (err) {
      setError('Failed to load topic')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!topic) return
    if (!confirm('Are you sure you want to delete this topic and all its subjects?')) return

    try {
      const response = await fetch(`/api/wiki/${topic.id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        router.push('/wiki')
      }
    } catch (err) {
      alert('Failed to delete topic')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-slate-400 mt-2">Loading topic...</p>
      </div>
    )
  }

  if (error || !topic) {
    return (
      <div className="space-y-6">
        <Link href="/wiki" className="text-blue-400 hover:underline">
          ← Back to Wiki
        </Link>
        <div className="border border-red-700 rounded-2xl p-8 text-center bg-red-900/30">
          <p className="text-red-400">{error || 'Topic not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href="/wiki" className="text-blue-400 hover:underline mb-4 inline-block">
          ← Back to Wiki
        </Link>
        <h1 className="text-4xl font-bold text-white mt-2">{topic.title}</h1>
      </div>

      {/* Meta */}
      <div className="flex gap-6 text-sm text-slate-400">
        <span>Created: {new Date(topic.createdAt).toLocaleDateString()}</span>
        <span>Updated: {new Date(topic.updatedAt).toLocaleDateString()}</span>
      </div>

      {/* Subjects Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">
          Subjects ({topic.subjects?.length || 0})
        </h2>
        <button
          onClick={() => setCreateSubjectModalOpen(true)}
          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors"
        >
          + Add Subject
        </button>
      </div>

      {/* Subjects List */}
      {topic.subjects && topic.subjects.length > 0 ? (
        <div className="space-y-4">
          {topic.subjects.map((subject) => (
            <Link
              key={subject.id}
              href={`/wiki/${topic.slug}/${subject.slug}`}
              className="block border border-slate-700 rounded-2xl p-6 hover:border-slate-600 hover:shadow-lg transition-all bg-slate-800"
            >
              <h3 className="text-lg font-semibold text-white hover:text-blue-400 transition-colors">
                {subject.title}
              </h3>
              <p className="text-slate-400 text-sm mt-2">
                {subject.contentItems?.length || 0} {subject.contentItems?.length === 1 ? 'item' : 'items'}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-600 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-2xl font-bold text-white mb-2">No Subjects Yet</h3>
          <p className="text-slate-400 mb-6">Create your first subject to get started</p>
          <button
            onClick={() => setCreateSubjectModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors"
          >
            + Create First Subject
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 flex-wrap">
        <button
          onClick={() => alert('Edit functionality coming soon')}
          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors"
        >
          ✏️ Edit Topic
        </button>
        <button
          onClick={handleDelete}
          className="px-6 py-2.5 border border-red-700 text-red-400 font-medium rounded-full hover:bg-red-900/20 transition-colors"
        >
          🗑️ Delete Topic
        </button>
      </div>

      {/* Create Subject Modal */}
      <CreateSubjectModal
        isOpen={createSubjectModalOpen}
        topicId={topic.id}
        onClose={() => setCreateSubjectModalOpen(false)}
        onSuccess={() => loadTopic()}
      />
    </div>
  )
}

