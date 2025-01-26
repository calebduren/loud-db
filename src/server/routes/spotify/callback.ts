import { FastifyInstance } from 'fastify';
import { SPOTIFY_CONFIG } from '../../../lib/spotify/config';
import { supabase } from '../../../lib/supabase';

export default async function (fastify: FastifyInstance) {
  fastify.get('/api/spotify/callback', async (request, reply) => {
    const { code, state, error } = request.query as { code?: string; state?: string; error?: string };

    // Check if there was an error
    if (error) {
      return reply.redirect(`/preferences?error=${error}`);
    }

    // Verify state to prevent CSRF attacks
    const storedState = request.cookies['spotify_auth_state'];
    if (!state || state !== storedState) {
      return reply.redirect('/preferences?error=invalid_state');
    }

    // Clean up state
    reply.clearCookie('spotify_auth_state');

    // Exchange code for access token
    const redirectUri = `${fastify.config.PUBLIC_URL}/api/spotify/callback`;
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CONFIG.clientId}:${SPOTIFY_CONFIG.clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: redirectUri
      })
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Error exchanging code for token:', error);
      return reply.redirect('/preferences?error=token_exchange_failed');
    }

    const { access_token, refresh_token } = await tokenResponse.json();

    // Get user's Spotify ID
    const userResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    if (!userResponse.ok) {
      console.error('Error fetching Spotify user:', await userResponse.text());
      return reply.redirect('/preferences?error=user_fetch_failed');
    }

    const { id: spotify_id } = await userResponse.json();

    // Get the current user from the session
    const session = await request.session();
    if (!session.user) {
      console.error('No user in session');
      return reply.redirect('/preferences?error=auth_error');
    }

    // Store the connection in the database
    const { error: dbError } = await supabase
      .from('spotify_connections')
      .upsert({
        user_id: session.user.id,
        spotify_id,
        access_token,
        refresh_token
      });

    if (dbError) {
      console.error('Error storing Spotify connection:', dbError);
      return reply.redirect('/preferences?error=database_error');
    }

    // Redirect back to preferences page with success message
    return reply.redirect('/preferences?success=true');
  });
}
