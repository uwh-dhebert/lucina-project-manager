'use client';

import Link from 'next/link';
import { useState } from 'react';

interface LinkItem {
  id: string;
  url: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
}

export default function LinksPage() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-white">Links</h1>
          <p className="text-slate-400 mt-2">Bookmark and organize your favorite URLs</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
        >
          + Add Link
        </button>
      </div>

      {links.length === 0 ? (
        <div className="border-2 border-dashed border-slate-600 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">🔗</div>
          <h2 className="text-2xl font-bold text-white mb-2">No links saved yet</h2>
          <p className="text-slate-400 mb-6">Add your first link to get started organizing your bookmarks.</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Add Your First Link
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {links.map((link) => (
            <div key={link.id} className="border border-slate-700 rounded-2xl p-6 hover:shadow-lg transition-all bg-slate-800">
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="block group">
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                  {link.name}
                </h3>
              </a>
              {link.description && (
                <p className="text-slate-400 text-sm mt-2 line-clamp-2">{link.description}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">{link.category}</span>
                {link.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

