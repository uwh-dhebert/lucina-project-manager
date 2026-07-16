import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getOrCreateProfile } from '@/lib/authz';
import { AuthShell } from '@/components/auth/AuthShell';
import { SignOutButton } from '@/components/auth/SignOutButton';

// Signed-in users whose profile is not APPROVED land here (see the protected
// layout). Approved users are bounced straight to the dashboard.

export default async function PendingApprovalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const profile = await getOrCreateProfile(user);

  if (profile.status === 'APPROVED') {
    redirect('/dashboard');
  }

  const rejected = profile.status === 'REJECTED';

  return (
    <AuthShell
      title={rejected ? 'Access declined' : 'Awaiting approval'}
      subtitle={rejected ? 'Your access request was declined' : 'Your account is almost ready'}
    >
      <div className="space-y-5 text-center">
        <p className="text-lucina-primary">
          {rejected
            ? 'An administrator declined your access request. If you believe this is a mistake, contact your Lucina administrator.'
            : 'Your account has been created, but an administrator needs to approve it before you can use Lucina. Check back soon — no email required.'}
        </p>
        <SignOutButton />
      </div>
    </AuthShell>
  );
}
