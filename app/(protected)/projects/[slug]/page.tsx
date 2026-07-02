'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { EditProjectModal } from '@/components/EditProjectModal'
import { DesignDocumentModal } from '@/components/DesignDocumentModal'

interface Project {
  id: string
  name: string
  slug: string
  description: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [designDocModalOpen, setDesignDocModalOpen] = useState(false)

  useEffect(() => {
    loadProject()
  }, [slug])

  const loadProject = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const projects = await response.json()
        const found = projects.find((p: Project) => p.slug === slug)
        if (found) {
          setProject(found)
        } else {
          setError('Project not found')
        }
      }
    } catch (err) {
      setError('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!project) return
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        router.push('/projects')
      }
    } catch (err) {
      alert('Failed to delete project')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-slate-400 mt-2">Loading project...</p>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="space-y-6">
        <Link href="/projects" className="text-blue-400 hover:underline">
          ← Back to Projects
        </Link>
        <div className="border border-red-700 rounded-2xl p-8 text-center bg-red-900/30">
          <p className="text-red-400">{error || 'Project not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href="/projects" className="text-blue-400 hover:underline mb-4 inline-block">
          ← Back to Projects
        </Link>
        <h1 className="text-4xl font-bold text-white mt-2">{project.name}</h1>
        {project.description && (
          <p className="text-slate-400 mt-2">{project.description}</p>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <p className="text-slate-400 text-sm mb-1">Project ID</p>
          <p className="text-white font-mono text-sm break-all">{project.id}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <p className="text-slate-400 text-sm mb-1">Slug</p>
          <p className="text-white font-mono">{project.slug}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <p className="text-slate-400 text-sm mb-1">Created</p>
          <p className="text-white">{new Date(project.createdAt).toLocaleDateString()}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <p className="text-slate-400 text-sm mb-1">Last Updated</p>
          <p className="text-white">{new Date(project.updatedAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Project Resources</h2>
        <p className="text-slate-400">
          Documentation and links are managed separately in the Wiki and Links sections for organization across all projects.
        </p>
      </div>

       {/* Actions */}
       <div className="space-y-4">
         <h2 className="text-2xl font-bold text-white">Actions</h2>
         <div className="flex gap-4 flex-wrap">
           <button
             onClick={() => setDesignDocModalOpen(true)}
             className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-full hover:from-purple-500 hover:to-purple-600 transition-colors"
           >
             📄 Generate Design Doc
           </button>
           <button
             onClick={() => setEditModalOpen(true)}
             className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors"
           >
             ✏️ Edit Project
           </button>
           <button
             onClick={handleDelete}
             className="px-6 py-2.5 border border-red-700 text-red-400 font-medium rounded-full hover:bg-red-900/20 transition-colors"
           >
             🗑️ Delete Project
           </button>
         </div>
       </div>

       {/* Edit Modal */}
       <EditProjectModal
         isOpen={editModalOpen}
         projectId={project.id}
         projectName={project.name}
         projectDescription={project.description}
         onClose={() => setEditModalOpen(false)}
         onSuccess={() => loadProject()}
       />

       {/* Design Document Modal */}
       <DesignDocumentModal
         isOpen={designDocModalOpen}
         onClose={() => setDesignDocModalOpen(false)}
         projectName={project.name}
         projectId={project.id}
       />
     </div>
   )
 }

