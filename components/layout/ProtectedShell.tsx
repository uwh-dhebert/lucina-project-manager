'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const WikiSidebar = dynamic(
  () => import('@/components/WikiSidebar').then((m) => m.WikiSidebar),
  { ssr: false, loading: () => <div className="px-4 py-2 text-xs text-slate-400 animate-pulse">Loading wiki...</div> }
);

const FloatingChatWidget = dynamic(
  () => import('@/components/FloatingChatWidget').then((m) => m.FloatingChatWidget),
  { ssr: false }
);

interface ProtectedShellProps {
  children: React.ReactNode;
  userEmail: string;
}

export function ProtectedShell({ children, userEmail }: ProtectedShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isWikiPage = pathname.includes('/wiki');

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      <nav className="sticky top-0 z-50 border-b border-slate-700 bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-75 transition">
              <div className="text-2xl">✨</div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                lucina
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-3">
              <span className="text-sm text-slate-400 px-3 py-1 bg-slate-800 rounded-full">{userEmail}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
              >
                Logout
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-slate-800 rounded-lg text-slate-400"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-slate-700 space-y-2">
              <div className="text-sm text-slate-400 px-3 py-2">{userEmail}</div>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="flex flex-1">
        {isWikiPage && (
          <aside className="hidden lg:flex w-64 border-r border-slate-700 bg-slate-900/50 flex-col overflow-hidden">
            <WikiSidebar />
          </aside>
        )}

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          {children}
        </main>
      </div>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-slate-500 border-t border-slate-700 mt-12 w-full">
        <p>© 2026 Lucina. Built with ✨ and Next.js</p>
      </footer>
      <FloatingChatWidget />
    </div>
  );
}