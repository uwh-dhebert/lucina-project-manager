'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, BookOpen } from 'lucide-react'

interface ContentItem {
  id: string
  title?: string
  content: string
  order: number
}

interface Subject {
  id: string
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
  subjects?: Subject[]
}

export function WikiTreeNav() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTopics()
  }, [])

  const loadTopics = async () => {
    try {
      const response = await fetch('/api/wiki')
      if (response.ok) {
        const data = await response.json()
        setTopics(data)
      }
    } catch (error) {
      console.error('Failed to load topics:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTopic = (topicId: string) => {
    const newExpanded = new Set(expandedTopics)
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId)
    } else {
      newExpanded.add(topicId)
    }
    setExpandedTopics(newExpanded)
  }

  if (loading) {
    return (
      <div className="px-4 py-2 text-sm text-slate-400">
        <span className="animate-pulse">Loading wiki...</span>
      </div>
    )
  }

  if (topics.length === 0) {
    return (
      <div className="px-4 py-2 text-sm text-slate-400">
        <Link href="/wiki" className="hover:text-blue-400 transition-colors">
          📖 Wiki
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="px-4 py-2 text-sm font-semibold text-slate-300 flex items-center gap-2">
        <BookOpen className="w-4 h-4" />
        <span>Wiki</span>
      </div>

      {topics.map((topic) => (
        <div key={topic.id} className="space-y-1">
          {/* Topic Item */}
          <div className="flex items-center gap-1 px-2 text-sm">
            <button
              onClick={() => toggleTopic(topic.id)}
              className="p-0 hover:bg-slate-700 rounded transition-colors"
            >
              {expandedTopics.has(topic.id) ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>
            <Link
              href={`/wiki/${topic.slug}`}
              className="flex-1 px-2 py-1.5 rounded hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors"
            >
              {topic.title}
            </Link>
          </div>

          {/* Subjects (shown when expanded) */}
          {expandedTopics.has(topic.id) && topic.subjects && (
            <div className="space-y-1 pl-4">
              {topic.subjects.map((subject) => (
                <Link
                  key={subject.id}
                  href={`/wiki/${topic.slug}/${subject.slug}`}
                  className="flex items-center gap-2 px-2 py-1.5 rounded text-sm text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition-colors"
                >
                  <span className="w-4" />
                  <span className="text-xs text-slate-500">•</span>
                  <span className="flex-1 truncate">{subject.title}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

