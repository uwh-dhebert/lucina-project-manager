'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CreateProjectModal } from '@/components/CreateProjectModal';

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 mt-2">Manage your projects and organize your work</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
        >
          + New Project
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-slate-400 mt-2">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="border border-dashed border-slate-600 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-slate-400 mb-6 text-lg">No projects yet. Create your first project to get started.</p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              className="group border border-slate-700 rounded-2xl p-6 hover:shadow-lg hover:border-slate-600 transition-all hover:-translate-y-0.5 bg-slate-800"
            >
              <h2 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                {project.name}
              </h2>
              {project.description && (
                <p className="text-slate-400 text-sm mt-2 line-clamp-2">{project.description}</p>
              )}
              <div className="text-xs text-slate-500 mt-4">
                Created {new Date(project.createdAt).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          loadProjects();
        }}
      />
    </div>
  );
}

