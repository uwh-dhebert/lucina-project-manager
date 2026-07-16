'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export function SignOutButton({ label = 'Sign out' }: { label?: string }) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      className="w-full py-3 btn-lucina transition-all"
    >
      {label}
    </button>
  );
}
