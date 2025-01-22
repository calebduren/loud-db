export function getPasswordResetEmailHtml(resetLink: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            line-height: 1.5;
            color: #1a1a1a;
          }
          .container {
            max-width: 580px;
            margin: 0 auto;
            padding: 20px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            font-size: 0.875rem;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Reset Your Password</h1>
          <p>We received a request to reset your password. Click the button below to choose a new password:</p>
          <a href="${resetLink}" class="button">Reset Password</a>
          <p>If you didn't request this password reset, you can safely ignore this email.</p>
          <div class="footer">
            <p>This link will expire in 1 hour.</p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>${resetLink}</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
