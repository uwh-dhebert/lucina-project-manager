import { NextResponse } from 'next/server';
import { Webhook } from 'standardwebhooks';
import { ResendService } from '@/infrastructure/external/ResendService';

interface SendEmailHookPayload {
  user: {
    email: string;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
  };
}

export async function POST(request: Request) {
  const hookSecret = process.env.SEND_EMAIL_HOOK_SECRET;

  if (!hookSecret) {
    return NextResponse.json(
      { error: { message: 'Send email hook is not configured' } },
      { status: 500 }
    );
  }

  try {
    const payload = await request.text();
    const headers = Object.fromEntries(request.headers);
    const secret = hookSecret.replace('v1,whsec_', '');
    const wh = new Webhook(secret);

    const { user, email_data } = wh.verify(payload, headers) as SendEmailHookPayload;

    const resend = new ResendService();
    await resend.sendAuthEmail({
      to: user.email,
      actionType: email_data.email_action_type,
      tokenHash: email_data.token_hash,
      token: email_data.token,
      redirectTo: email_data.redirect_to,
    });

    return NextResponse.json({});
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send email';
    console.error('Send email hook error:', message);

    return NextResponse.json(
      { error: { message } },
      { status: 401 }
    );
  }
}