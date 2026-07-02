'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CreateTopicModal } from '@/components/CreateTopicModal'

interface ContentItem {
  id: string
  title?: string
  content: string
  order: number
  createdAt: string
  updatedAt: string
}

interface Subject {
  id: string
  title: string
  slug: string
  order: number
  createdAt: string
  updatedAt: string
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

export default function WikiPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [setupNeeded, setSetupNeeded] = useState(false)
  const [setupInstructions, setSetupInstructions] = useState<string[]>([])

  useEffect(() => {
    loadTopics()
  }, [])

  const loadTopics = async () => {
    try {
      const response = await fetch('/api/wiki')
      if (response.ok) {
        const data = await response.json()
        setTopics(data)
        setSetupNeeded(false)
      } else {
        setSetupNeeded(true)
        // Get setup instructions
        const setupRes = await fetch('/api/wiki/setup')
        if (setupRes.ok) {
          const setupData = await setupRes.json()
          if (setupData.instructions) {
            setSetupInstructions(setupData.instructions)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load topics:', error)
      setSetupNeeded(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-white">Wiki</h1>
          <p className="text-slate-400 mt-2">Topics → Subjects → Content Items</p>
        </div>
        {!setupNeeded && (
          <button
            onClick={() => setModalOpen(true)}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            + New Topic
          </button>
        )}
      </div>

      {/* Setup Needed */}
      {setupNeeded ? (
        <div className="border-2 border-dashed border-slate-600 rounded-2xl p-12">
          <div className="text-5xl mb-4 text-center">⚙️</div>
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Wiki Setup Required</h2>
          <p className="text-slate-400 mb-6 text-center">Follow these steps to initialize the wiki tables:</p>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
            <ol className="space-y-3">
              {setupInstructions.map((instruction, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="flex-shrink-0 font-semibold text-blue-400 w-6">{idx + 1}.</span>
                  <span className="text-slate-300">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors inline-block"
            >
              🚀 Open Supabase Dashboard
            </a>
            <button
              onClick={loadTopics}
              className="px-6 py-3 border border-slate-600 text-slate-300 font-medium rounded-full hover:bg-slate-700 transition-colors"
            >
              🔄 Check Again
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-6 text-center">
            File to use: <span className="font-mono bg-slate-700 px-2 py-1 rounded">WIKI_RESTRUCTURE_NO_RLS.sql</span>
          </p>
        </div>
      ) : loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-slate-400 mt-2">Loading topics...</p>
        </div>
      ) : topics.length === 0 ? (
        <div className="border-2 border-dashed border-slate-600 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">📖</div>
          <h2 className="text-2xl font-bold text-white mb-2">No Topics Yet</h2>
          <p className="text-slate-400 mb-6">Start building your wiki by creating your first topic</p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors"
          >
            + Create First Topic
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {topics.map((topic) => (
            <div key={topic.id} className="border border-slate-700 rounded-2xl overflow-hidden bg-slate-800">
              {/* Topic Header */}
              <Link
                href={`/wiki/${topic.slug}`}
                className="block p-6 hover:bg-slate-700/50 transition-colors border-b border-slate-700"
              >
                <h2 className="text-2xl font-bold text-white hover:text-blue-400 transition-colors">
                  {topic.title}
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  {topic.subjects?.length || 0} {topic.subjects?.length === 1 ? 'subject' : 'subjects'}
                </p>
              </Link>

              {/* Subjects Preview */}
              {topic.subjects && topic.subjects.length > 0 && (
                <div className="p-6 space-y-3">
                  {topic.subjects.slice(0, 3).map((subject) => (
                    <div key={subject.id} className="p-3 bg-slate-700/50 rounded-lg">
                      <div className="font-semibold text-slate-200">{subject.title}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {subject.contentItems?.length || 0} item{subject.contentItems?.length === 1 ? '' : 's'}
                      </div>
                    </div>
                  ))}
                  {topic.subjects.length > 3 && (
                    <div className="text-xs text-slate-500 text-center pt-2">
                      +{topic.subjects.length - 3} more subject{topic.subjects.length - 3 === 1 ? '' : 's'}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Topic Modal */}
      {!setupNeeded && (
        <CreateTopicModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false)
            loadTopics()
          }}
        />
      )}
    </div>
  )
}

