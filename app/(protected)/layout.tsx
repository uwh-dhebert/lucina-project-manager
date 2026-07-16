import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { ProtectedShell } from '@/components/layout/ProtectedShell';
import { getAuthUserDisplayName } from '@/lib/users';
import { getOrCreateProfile } from '@/lib/authz';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Approval gate: accounts start PENDING and see /auth/pending until an
  // admin approves them on /admin/users.
  const profile = await getOrCreateProfile(user);
  if (profile.status !== 'APPROVED') {
    redirect('/auth/pending');
  }

  const userName = getAuthUserDisplayName(user.user_metadata, user.email);

  return (
    <ProtectedShell userName={userName} isAdmin={profile.role === 'ADMIN'}>
      {children}
    </ProtectedShell>
  );
}
