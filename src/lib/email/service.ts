import { resend, EMAIL_CONFIG } from './config';
import { getWelcomeEmailHtml } from './templates/welcome';
import { getPasswordResetEmailHtml } from './templates/passwordReset';

export async function sendWelcomeEmail(email: string, username: string) {
  try {
    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: email,
      subject: 'Welcome to loud db!',
      html: getWelcomeEmailHtml(username)
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  try {
    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: email,
      subject: 'Reset Your Password',
      html: getPasswordResetEmailHtml(resetLink)
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
  }
}