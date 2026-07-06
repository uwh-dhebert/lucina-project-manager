import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { ResendService } from '@/infrastructure/external/ResendService';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;
    const redirectTo = `${siteUrl}/auth/callback?next=/auth/reset-password`;

    const supabase = createAdminClient();
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email.trim(),
      options: { redirectTo },
    });

    if (!error && data?.properties?.action_link) {
      const resend = new ResendService();
      await resend.sendPasswordResetEmail({
        to: email.trim(),
        resetLink: data.properties.action_link,
      });
    }

    // Always return success to avoid revealing whether the account exists.
    return NextResponse.json({
      message: 'If an account exists for that email, a reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);

    return NextResponse.json({
      message: 'If an account exists for that email, a reset link has been sent.',
    });
  }
}