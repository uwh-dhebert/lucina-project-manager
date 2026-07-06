import { Resend } from 'resend';
import {
  buildAuthEmailHtml,
  buildSupabaseVerifyUrl,
  getAuthEmailContent,
} from './auth-email-templates';

export class ResendService {
  private resend: Resend;
  private fromEmail: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }

    this.resend = new Resend(apiKey);
    this.fromEmail = process.env.RESEND_FROM_EMAIL ?? 'Lucina <onboarding@resend.dev>';
  }

  async sendAuthEmail({
    to,
    actionType,
    tokenHash,
    token,
    redirectTo,
  }: {
    to: string;
    actionType: string;
    tokenHash: string;
    token?: string;
    redirectTo: string;
  }) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
    }

    const content = getAuthEmailContent(actionType);
    const actionUrl = buildSupabaseVerifyUrl(supabaseUrl, tokenHash, actionType, redirectTo);

    const html = buildAuthEmailHtml({
      heading: content.heading,
      body: content.body,
      buttonLabel: content.buttonLabel,
      footer: content.footer,
      actionUrl,
      otpCode: token,
    });

    const { error } = await this.resend.emails.send({
      from: this.fromEmail,
      to: [to],
      subject: content.subject,
      html,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async sendPasswordResetEmail({
    to,
    resetLink,
  }: {
    to: string;
    resetLink: string;
  }) {
    const content = getAuthEmailContent('recovery');
    const html = buildAuthEmailHtml({
      heading: content.heading,
      body: content.body,
      buttonLabel: content.buttonLabel,
      footer: content.footer,
      actionUrl: resetLink,
    });

    const { error } = await this.resend.emails.send({
      from: this.fromEmail,
      to: [to],
      subject: content.subject,
      html,
    });

    if (error) {
      throw new Error(error.message);
    }
  }
}