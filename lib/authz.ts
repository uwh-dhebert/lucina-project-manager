import { randomUUID } from 'node:crypto';
import type { User } from '@supabase/supabase-js';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';

// Access is approval-gated: registering creates an account immediately (no
// confirmation email), but a profile starts PENDING until an admin approves it
// on /admin/users. Admins can also grant ADMIN to others, which is what gives
// access to the approval screen itself.

// Accounts that become admins automatically the moment they register (or on
// backfill), so the very first admin exists without manual SQL.
export const ADMIN_BOOTSTRAP_EMAILS = [
  'daniel.hebert@lucina.com',
  'heberts.tkd@gmail.com',
];

export type ProfileRole = 'ADMIN' | 'USER';
export type ProfileStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Profile {
  id: string;
  userId: string;
  email: string;
  fullName: string | null;
  role: ProfileRole;
  status: ProfileStatus;
  createdAt: string;
}

export function isBootstrapAdmin(email: string): boolean {
  return ADMIN_BOOTSTRAP_EMAILS.includes(email.trim().toLowerCase());
}

// Profiles are always read/written with the service-role client: the table has
// no RLS policies, and approval state must not depend on the caller's session.
export async function getOrCreateProfile(user: User): Promise<Profile> {
  const admin = createAdminClient();

  const { data: existing, error: readError } = await admin
    .from('profiles')
    .select('id, userId, email, fullName, role, status, createdAt')
    .eq('userId', user.id)
    .maybeSingle();

  if (readError) throw new Error(readError.message);
  if (existing) return existing as Profile;

  // Accounts that predate the approval gate (or were created outside the
  // register route) get a profile on first sight. Bootstrap admins come in
  // approved; everyone else waits for approval.
  const email = user.email ?? '';
  const bootstrap = isBootstrapAdmin(email);
  const now = new Date().toISOString();
  const profile = {
    id: randomUUID(),
    userId: user.id,
    email,
    fullName:
      (user.user_metadata?.full_name as string | undefined) ??
      (user.user_metadata?.name as string | undefined) ??
      null,
    role: bootstrap ? 'ADMIN' : 'USER',
    status: bootstrap ? 'APPROVED' : 'PENDING',
    createdAt: now,
    updatedAt: now,
  };

  const { data: created, error: writeError } = await admin
    .from('profiles')
    .insert(profile)
    .select('id, userId, email, fullName, role, status, createdAt')
    .single();

  if (writeError) throw new Error(writeError.message);
  return created as Profile;
}

export interface AdminContext {
  user: User;
  profile: Profile;
}

// Guard for admin API routes. Returns the caller when they are an approved
// admin; otherwise the HTTP status the route should respond with.
export async function requireAdmin(): Promise<
  { ok: true; context: AdminContext } | { ok: false; status: 401 | 403 }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, status: 401 };

  const profile = await getOrCreateProfile(user);
  if (profile.role !== 'ADMIN' || profile.status !== 'APPROVED') {
    return { ok: false, status: 403 };
  }

  return { ok: true, context: { user, profile } };
}
