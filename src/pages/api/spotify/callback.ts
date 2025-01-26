import { SPOTIFY_CONFIG } from '../../../lib/spotify/config';
import { supabase } from '../../../lib/supabase';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  // Check if there was an error
  if (error) {
    return Response.redirect(`${url.origin}/preferences?error=${error}`);
  }

  // Verify state to prevent CSRF attacks
  const storedState = localStorage.getItem('spotify_auth_state');
  if (!state || state !== storedState) {
    return Response.redirect(`${url.origin}/preferences?error=invalid_state`);
  }

  // Clean up state
  localStorage.removeItem('spotify_auth_state');

  // Exchange code for access token
  const redirectUri = `${url.origin}/api/spotify/callback`;
  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${SPOTIFY_CONFIG.clientId}:${SPOTIFY_CONFIG.clientSecret}`)}`
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri
    })
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    console.error('Error exchanging code for token:', error);
    return Response.redirect(`${url.origin}/preferences?error=token_exchange_failed`);
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
    return Response.redirect(`${url.origin}/preferences?error=user_fetch_failed`);
  }

  const { id: spotify_id } = await userResponse.json();

  // Get the current user from Supabase
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('Error getting user:', authError);
    return Response.redirect(`${url.origin}/preferences?error=auth_error`);
  }

  // Store the connection in the database
  const { error: dbError } = await supabase
    .from('spotify_connections')
    .upsert({
      user_id: user.id,
      spotify_id,
      access_token,
      refresh_token
    });

  if (dbError) {
    console.error('Error storing Spotify connection:', dbError);
    return Response.redirect(`${url.origin}/preferences?error=database_error`);
  }

  // Redirect back to preferences page with success message
  return Response.redirect(`${url.origin}/preferences?success=true`);
}
