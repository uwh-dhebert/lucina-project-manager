import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/authz';
import { createAdminClient } from '@/utils/supabase/admin';

// List all user profiles for the admin approval screen. Pending accounts
// first, then newest first within each status.

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.status === 401 ? 'Not signed in.' : 'Admin access required.' },
        { status: auth.status }
      );
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('profiles')
      .select('id, userId, email, fullName, role, status, createdAt')
      .order('createdAt', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const statusRank = { PENDING: 0, APPROVED: 1, REJECTED: 2 } as const;
    const users = (data ?? []).sort(
      (a, b) =>
        (statusRank[a.status as keyof typeof statusRank] ?? 3) -
        (statusRank[b.status as keyof typeof statusRank] ?? 3)
    );

    return NextResponse.json({
      users,
      currentUserId: auth.context.user.id,
    });
  } catch (error) {
    console.error('Admin list users error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list users.' },
      { status: 500 }
    );
  }
}
