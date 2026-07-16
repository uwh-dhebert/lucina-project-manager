'use client';

import { useCallback, useEffect, useState } from 'react';

interface AdminUser {
  id: string;
  userId: string;
  email: string;
  fullName: string | null;
  role: 'ADMIN' | 'USER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

const statusBadge: Record<AdminUser['status'], string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-300',
  APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  REJECTED: 'bg-red-100 text-red-800 border-red-300',
};

const actionButtonClass =
  'px-3 py-1.5 text-xs font-bold rounded-lg border-2 border-lucina-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

export function UsersAdmin() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to load users.');
        return;
      }
      setUsers(data.users);
      setCurrentUserId(data.currentUserId);
      setError('');
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = async (id: string, patch: { status?: string; role?: string }) => {
    setBusyId(id);
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Update failed.');
        return;
      }
      setUsers((prev) => prev.map((u) => (u.id === id ? data.user : u)));
    } catch {
      setError('Update failed.');
    } finally {
      setBusyId(null);
    }
  };

  const pendingCount = users.filter((u) => u.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-lucina-primary">Users</h1>
        <p className="text-lucina-muted mt-1">
          Approve new accounts and manage who can access this screen.
          {pendingCount > 0 && (
            <span className="ml-2 font-semibold text-amber-700">
              {pendingCount} awaiting approval
            </span>
          )}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl border-2 border-red-300 bg-red-50 text-red-800 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-lucina-muted animate-pulse">Loading users...</div>
      ) : (
        <div className="bg-lucina-white rounded-2xl border-2 border-lucina-rose overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-lucina-accent text-left text-lucina-primary">
                  <th className="px-4 py-3 font-bold">Name</th>
                  <th className="px-4 py-3 font-bold">Email</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold">Role</th>
                  <th className="px-4 py-3 font-bold">Joined</th>
                  <th className="px-4 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isSelf = user.userId === currentUserId;
                  const busy = busyId === user.id;
                  return (
                    <tr key={user.id} className="border-t border-lucina-rose/50">
                      <td className="px-4 py-3 font-semibold text-lucina-primary">
                        {user.fullName || '—'}
                        {isSelf && <span className="ml-2 text-xs text-lucina-muted">(you)</span>}
                      </td>
                      <td className="px-4 py-3 text-lucina-primary">{user.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-bold rounded-full border ${statusBadge[user.status]}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-lucina-primary">
                        {user.role === 'ADMIN' ? (
                          <span className="font-bold">Admin</span>
                        ) : (
                          'User'
                        )}
                      </td>
                      <td className="px-4 py-3 text-lucina-muted whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-end flex-wrap">
                          {user.status !== 'APPROVED' && (
                            <button
                              className={`${actionButtonClass} bg-emerald-200 text-emerald-900 hover:bg-emerald-300`}
                              disabled={isSelf || busy}
                              onClick={() => update(user.id, { status: 'APPROVED' })}
                            >
                              Approve
                            </button>
                          )}
                          {user.status !== 'REJECTED' && (
                            <button
                              className={`${actionButtonClass} bg-red-200 text-red-900 hover:bg-red-300`}
                              disabled={isSelf || busy}
                              onClick={() => update(user.id, { status: 'REJECTED' })}
                            >
                              {user.status === 'APPROVED' ? 'Revoke' : 'Reject'}
                            </button>
                          )}
                          {user.role === 'USER' ? (
                            <button
                              className={`${actionButtonClass} bg-lucina-rose text-lucina-primary hover:bg-lucina-rose-hover`}
                              disabled={isSelf || busy}
                              onClick={() => update(user.id, { role: 'ADMIN' })}
                            >
                              Make admin
                            </button>
                          ) : (
                            <button
                              className={`${actionButtonClass} bg-lucina-accent text-lucina-primary hover:bg-lucina-rose`}
                              disabled={isSelf || busy}
                              onClick={() => update(user.id, { role: 'USER' })}
                            >
                              Remove admin
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-lucina-muted">
                      No users yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
