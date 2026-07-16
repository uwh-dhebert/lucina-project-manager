import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getOrCreateProfile } from '@/lib/authz';
import { UsersAdmin } from '@/components/admin/UsersAdmin';

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const profile = await getOrCreateProfile(user);
  if (profile.role !== 'ADMIN' || profile.status !== 'APPROVED') {
    redirect('/dashboard');
  }

  return <UsersAdmin />;
}
