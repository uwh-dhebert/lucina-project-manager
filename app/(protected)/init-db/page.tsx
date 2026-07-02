'use client'

import { useEffect, useState } from 'react'

export default function InitDbPage() {
  const [status, setStatus] = useState<'checking' | 'ready' | 'error' | 'initializing'>('checking')
  const [message, setMessage] = useState('')

  useEffect(() => {
    checkDatabase()
  }, [])

  const checkDatabase = async () => {
    try {
      const response = await fetch('/api/init-db')
      const data = await response.json()

      if (data.initialized) {
        setStatus('ready')
        setMessage('✅ Database is ready! Redirecting...')
        setTimeout(() => {
          window.location.href = '/projects'
        }, 2000)
      } else {
        setStatus('error')
        setMessage(data.message || 'Database not initialized')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Failed to check database status')
    }
  }

  const initializeDatabase = async () => {
    setStatus('initializing')
    setMessage('Initializing database...')

    try {
      const response = await fetch('/api/init-db', { method: 'POST' })
      const data = await response.json()

      if (data.success) {
        setStatus('ready')
        setMessage('✅ Database initialized! Redirecting...')
        setTimeout(() => {
          window.location.href = '/projects'
        }, 2000)
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to initialize database')
      }
    } catch (error: any) {
      setStatus('error')
      setMessage(error.message || 'Failed to initialize database')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="text-4xl">✨</div>
            <span className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              lucina
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">Database Setup</h1>
          <p className="text-slate-400 mt-2">Initialize your database to get started</p>
        </div>

        {/* Status Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 mb-8">
          {status === 'checking' && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-slate-300">Checking database status...</p>
            </div>
          )}

          {status === 'initializing' && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-slate-300">Initializing database...</p>
              <p className="text-slate-500 text-sm mt-2">This may take a moment...</p>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div className="text-center mb-6">
                <p className="text-red-400 mb-4">{message}</p>
              </div>

              <div className="space-y-6">
                {/* Option 1 */}
                <div className="border border-blue-700 rounded-xl p-6 bg-blue-900/30">
                  <h3 className="text-lg font-semibold text-white mb-2">Option 1: Initialize Here</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Click the button below to attempt automatic initialization (requires network access to Supabase).
                  </p>
                  <button
                    onClick={initializeDatabase}
                    className="w-full px-4 py-2.5 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors"
                  >
                    Initialize Database
                  </button>
                </div>

                {/* Option 2 */}
                <div className="border border-purple-700 rounded-xl p-6 bg-purple-900/30">
                  <h3 className="text-lg font-semibold text-white mb-2">Option 2: Use Supabase Dashboard</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Use Supabase SQL Editor to run the database setup script manually.
                  </p>
                  <div className="space-y-2 text-sm text-slate-400 mb-4">
                    <p>1. Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Supabase Dashboard</a></p>
                    <p>2. Select your project</p>
                    <p>3. Open SQL Editor → New Query</p>
                    <p>4. Copy all content from <code className="bg-slate-900 px-2 py-1 rounded">DATABASE_SETUP.sql</code></p>
                    <p>5. Paste and click Run</p>
                  </div>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-4 py-2.5 bg-purple-600 text-white font-medium rounded-full hover:bg-purple-700 transition-colors text-center"
                  >
                    Open Supabase Dashboard
                  </a>
                </div>

                {/* Option 3 */}
                <div className="border border-green-700 rounded-xl p-6 bg-green-900/30">
                  <h3 className="text-lg font-semibold text-white mb-2">Option 3: Use Terminal (Advanced)</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Run this command in your terminal to initialize the database:
                  </p>
                  <div className="bg-slate-900 p-3 rounded-lg mb-4 overflow-x-auto">
                    <code className="text-sm text-slate-200 whitespace-nowrap">
                      bun run scripts/init-db.ts
                    </code>
                  </div>
                  <p className="text-slate-500 text-xs">Requires psql to be installed</p>
                </div>
              </div>
            </div>
          )}

          {status === 'ready' && (
            <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <p className="text-green-400 text-lg font-semibold mb-2">{message}</p>
              <p className="text-slate-400">You will be redirected shortly...</p>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">❓ What is happening?</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Your Lucina app needs to create database tables in Supabase. Choose any of the three options above to initialize your database. Once complete, you'll be able to create projects and use all features!
          </p>
        </div>
      </div>
    </div>
  )
}

