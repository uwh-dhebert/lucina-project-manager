'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

export default function ProjectDocumentationPage() {
  const params = useParams()
  const slug = params.slug as string
  const [topics, setTopics] = useState<any[]>([])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href={`/projects/${slug}`} className="text-blue-400 hover:underline mb-4 inline-block">
          ← Back to Project
        </Link>
        <h1 className="text-4xl font-bold text-white mt-2">Documentation</h1>
        <p className="text-slate-400 mt-2">Wiki-style documentation for this project</p>
      </div>

      {/* Actions */}
      <div>
        <button className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors">
          + New Topic
        </button>
      </div>

      {/* Topics List */}
      {topics.length === 0 ? (
        <div className="border-2 border-dashed border-slate-600 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">📖</div>
          <h2 className="text-2xl font-bold text-white mb-2">No Documentation Yet</h2>
          <p className="text-slate-400 mb-6">Start by creating your first documentation topic</p>
          <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors">
            + Create First Topic
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              href={`/projects/${slug}/documentation/${topic.slug}`}
              className="block border border-slate-700 rounded-2xl p-6 hover:border-slate-600 hover:shadow-lg transition-all bg-slate-800"
            >
              <h3 className="text-lg font-semibold text-white">{topic.title}</h3>
              {topic.description && (
                <p className="text-slate-400 text-sm mt-1">{topic.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

