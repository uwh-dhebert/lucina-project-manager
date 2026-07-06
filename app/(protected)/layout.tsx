import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { ProtectedShell } from '@/components/layout/ProtectedShell';

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

  return (
    <ProtectedShell userEmail={user.email ?? ''}>
      {children}
    </ProtectedShell>
  );
}