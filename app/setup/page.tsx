'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function SetupPage() {
  const [status, setStatus] = useState<'checking' | 'ready' | 'error' | 'initializing'>('checking')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    checkDatabase()
  }, [])

  const checkDatabase = async () => {
    setStatus('checking')
    setErrorMsg('')
    try {
      const response = await fetch('/api/init-db')
      const data = await response.json()

      if (data.initialized) {
        setStatus('ready')
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 2000)
      } else {
        setStatus('error')
        setErrorMsg(data.error || 'Database tables not found')
      }
    } catch (error) {
      setStatus('error')
      setErrorMsg('Failed to check database status')
    }
  }

  const initializeDatabase = async () => {
    setStatus('initializing')

    try {
      const response = await fetch('/api/init-db', { method: 'POST' })
      const data = await response.json()

      if (data.success) {
        setStatus('ready')
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 2000)
      } else {
        setStatus('error')
      }
    } catch (error) {
      setStatus('error')
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
          <h1 className="text-2xl font-bold text-white">Setup Required</h1>
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
                <p className="text-red-400 mb-4">{errorMsg || 'Database tables not found'}</p>
                <p className="text-slate-400 text-sm">We need to set up your database before you can use Lucina.</p>
              </div>

              <div className="space-y-4">
                {/* Refresh Button */}
                <button
                  onClick={checkDatabase}
                  className="w-full px-4 py-3 border border-slate-600 text-slate-300 font-medium rounded-full hover:bg-slate-700 transition-colors"
                >
                  🔄 Check Status Again
                </button>

                {/* Initialize Button */}
                <button
                  onClick={initializeDatabase}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg transition-all hover:scale-105"
                >
                  🚀 Try Initialize
                </button>

                {/* Option 2 */}
                <div className="text-center text-sm text-slate-400">
                  <p className="mb-3">Or use Supabase Dashboard:</p>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 border border-slate-600 text-slate-300 rounded-full hover:border-slate-500 hover:bg-slate-700 transition-colors"
                  >
                    Open Supabase Dashboard →
                  </a>
                  <p className="mt-3 text-xs">Copy DATABASE_SETUP.sql to SQL Editor and run</p>
                </div>
              </div>

              {/* Help */}
              <div className="mt-6 pt-6 border-t border-slate-700">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Already ran the SQL in Supabase? Click "Check Status Again" to verify. If still not working, try refreshing the page (F5) or clearing browser cache.
                </p>
              </div>
            </div>
          )}

          {status === 'ready' && (
            <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <p className="text-green-400 text-lg font-semibold mb-2">Database Ready!</p>
              <p className="text-slate-400">Redirecting to dashboard...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

