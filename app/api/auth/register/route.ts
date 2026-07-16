import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { createAdminClient } from '@/utils/supabase/admin';
import { getSignupEmailError, normalizeSignupEmail } from '@/lib/auth-email';
import { getSupabaseConfigError } from '@/lib/supabase-env';
import { isBootstrapAdmin } from '@/lib/authz';

// Registration is approval-gated instead of email-confirmed: the account is
// created immediately with the email marked confirmed (no email is ever sent),
// and a PENDING profile row gates access until an admin approves it on
// /admin/users.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, password } = body;

    const emailError = getSignupEmailError(email);
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }

    if (!fullName?.trim()) {
      return NextResponse.json({ error: 'Full name is required.' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const supabaseConfigError = getSupabaseConfigError();
    if (supabaseConfigError) {
      console.error('Register supabase config error:', supabaseConfigError);
      return NextResponse.json({ error: supabaseConfigError }, { status: 503 });
    }

    const normalizedEmail = normalizeSignupEmail(email);
    const supabase = createAdminClient();

    const { data, error } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName.trim() },
    });

    if (error) {
      const message = error.message.toLowerCase();

      if (
        message.includes('already') ||
        message.includes('registered') ||
        message.includes('exists')
      ) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Try signing in or use Forgot password.' },
          { status: 409 }
        );
      }

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Account could not be created. Please try again.' },
        { status: 500 }
      );
    }

    const bootstrap = isBootstrapAdmin(normalizedEmail);
    const now = new Date().toISOString();
    const { error: profileError } = await supabase.from('profiles').insert({
      id: randomUUID(),
      userId: data.user.id,
      email: normalizedEmail,
      fullName: fullName.trim(),
      role: bootstrap ? 'ADMIN' : 'USER',
      status: bootstrap ? 'APPROVED' : 'PENDING',
      createdAt: now,
      updatedAt: now,
    });

    // A missing profile row is recovered by getOrCreateProfile on first sign-in,
    // so log it but do not fail the registration.
    if (profileError) {
      console.error('Register profile insert error:', profileError.message);
    }

    return NextResponse.json({
      message: bootstrap
        ? 'Account created. You can sign in now.'
        : 'Account created. An administrator needs to approve your access — you can sign in once that happens.',
      requiresApproval: !bootstrap,
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Registration failed.' },
      { status: 500 }
    );
  }
}
