'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/AuthShell';
import { AuthAlert } from '@/components/auth/AuthAlert';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error ?? 'Failed to send reset link. Please try again.');
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a link to choose a new password"
      footer={
        <p className="text-center text-slate-400 text-sm">
          Remember your password?{' '}
          <Link href="/auth/login" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
            Sign in
          </Link>
        </p>
      }
    >
      {submitted ? (
        <div className="space-y-5">
          <AuthAlert
            variant="success"
            message="If an account exists for that email, we've sent a password reset link. Check your inbox and spam folder."
          />
          <Link
            href="/auth/login"
            className="block w-full py-3 text-center bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-full transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-200 mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-700/80 text-white placeholder-slate-500 transition-all"
              disabled={loading}
            />
          </div>

          {error && <AuthAlert variant="error" message={error} />}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Sending link...
              </span>
            ) : (
              'Send reset link'
            )}
          </button>
        </form>
      )}
    </AuthShell>
  );
}