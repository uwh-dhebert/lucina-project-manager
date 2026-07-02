'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

export default function ProjectLinksPage() {
  const params = useParams()
  const slug = params.slug as string
  const [links, setLinks] = useState<any[]>([])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href={`/projects/${slug}`} className="text-blue-400 hover:underline mb-4 inline-block">
          ← Back to Project
        </Link>
        <h1 className="text-4xl font-bold text-white mt-2">Links</h1>
        <p className="text-slate-400 mt-2">Project-specific links and resources</p>
      </div>

      {/* Actions */}
      <div>
        <button className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors">
          + Add Link
        </button>
      </div>

      {/* Links List */}
      {links.length === 0 ? (
        <div className="border-2 border-dashed border-slate-600 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">🔗</div>
          <h2 className="text-2xl font-bold text-white mb-2">No Links Yet</h2>
          <p className="text-slate-400 mb-6">Add links and resources related to this project</p>
          <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors">
            + Add First Link
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-slate-700 rounded-2xl p-6 hover:border-slate-600 hover:shadow-lg transition-all bg-slate-800 group"
            >
              <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                {link.name}
              </h3>
              {link.description && (
                <p className="text-slate-400 text-sm mt-1 line-clamp-2">{link.description}</p>
              )}
              <div className="mt-4 flex gap-2 flex-wrap">
                <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">
                  {link.category}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

