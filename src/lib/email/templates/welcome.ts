export function getWelcomeEmailHtml(username: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to loud db</title>
      </head>
      <body style="font-family: system-ui, sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #000000;">Welcome to loud db!</h1>
        <p>Hi ${username},</p>
        <p>Welcome to loud db! We're excited to have you join our community of music enthusiasts.</p>
        <p>Here's what you can do now:</p>
        <ul>
          <li>Discover new releases</li>
          <li>Create your music profile</li>
          <li>Connect with other music lovers</li>
        </ul>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Happy listening!</p>
        <p>The loud db team</p>
      </body>
    </html>
  `;
}