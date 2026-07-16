import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/authz';
import { createAdminClient } from '@/utils/supabase/admin';

const VALID_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;
const VALID_ROLES = ['ADMIN', 'USER'] as const;

// Update a user's approval status and/or role. Admins cannot modify their own
// row, so an admin can never lock themself out by accident.

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.status === 401 ? 'Not signed in.' : 'Admin access required.' },
        { status: auth.status }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const updates: { status?: string; role?: string } = {};

    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
      }
      updates.status = body.status;
    }

    if (body.role !== undefined) {
      if (!VALID_ROLES.includes(body.role)) {
        return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
      }
      updates.role = body.role;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: target, error: readError } = await admin
      .from('profiles')
      .select('id, userId')
      .eq('id', id)
      .maybeSingle();

    if (readError) {
      return NextResponse.json({ error: readError.message }, { status: 500 });
    }
    if (!target) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (target.userId === auth.context.user.id) {
      return NextResponse.json(
        { error: 'You cannot change your own access.' },
        { status: 400 }
      );
    }

    const { data: updated, error: updateError } = await admin
      .from('profiles')
      .update({ ...updates, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select('id, userId, email, fullName, role, status, createdAt')
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error('Admin update user error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update user.' },
      { status: 500 }
    );
  }
}
