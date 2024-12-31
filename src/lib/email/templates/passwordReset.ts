export function getPasswordResetEmailHtml(resetLink: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: system-ui, sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #000000;">Reset Your Password</h1>
        <p>You requested to reset your password. Click the button below to create a new password:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background: #000000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>The loud db team</p>
      </body>
    </html>
  `;
}