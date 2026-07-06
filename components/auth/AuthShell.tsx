import Link from 'next/link';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-6 hover:opacity-80 transition">
            <span className="text-4xl" aria-hidden>✨</span>
            <span className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              lucina
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-slate-400 mt-2">{subtitle}</p>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700">
          {children}
        </div>

        {footer && <div className="mt-6">{footer}</div>}

        <p className="mt-8 text-center text-xs text-slate-500">
          © 2026 Lucina. All rights reserved.
        </p>
      </div>
    </div>
  );
}