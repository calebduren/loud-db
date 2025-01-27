import { supabase } from '../supabase';
import { spotifyApi, initializeApi } from './api';
import { handleError } from '../utils/errorHandling';

const SPOTIFY_CONFIG = {
  clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
  clientSecret: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET,
  redirectUri: `${window.location.origin}/settings`,
  scopes: [
    'user-read-private',
    'user-read-email',
    'user-top-read',
    'user-library-read'
  ]
};

export async function getSpotifyToken(): Promise<string> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('Not authenticated');
    }

    const { data: connection, error } = await supabase
      .from('spotify_connections')
      .select('id, access_token, refresh_token, expires_at')
      .eq('user_id', user.user.id)
      .maybeSingle();

    if (error) throw error;
    if (!connection) return '';

    // Check if token needs refresh
    const expiresAt = new Date(connection.expires_at);
    if (expiresAt > new Date()) {
      initializeApi(connection.access_token);
      return connection.access_token;
    }

    // Refresh token
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(encodeURIComponent(SPOTIFY_CONFIG.clientId) + ':' + encodeURIComponent(SPOTIFY_CONFIG.clientSecret))}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: connection.refresh_token
      })
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    
    // Calculate new expiration time
    const newExpiresAt = new Date();
    newExpiresAt.setSeconds(newExpiresAt.getSeconds() + data.expires_in);

    // Update tokens in database
    const { error: updateError } = await supabase
      .from('spotify_connections')
      .update({
        access_token: data.access_token,
        expires_at: newExpiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', connection.id);

    if (updateError) throw updateError;

    // Update API client
    initializeApi(data.access_token);
    return data.access_token;
  } catch (error) {
    handleError(error, 'Failed to get Spotify token');
    return '';
  }
}

export async function initiateSpotifyAuth() {
  const state = crypto.randomUUID();
  
  // Validate required config
  if (!SPOTIFY_CONFIG.clientId) {
    throw new Error('Missing Spotify client ID');
  }

  // Store state in localStorage to verify callback
  localStorage.setItem('spotify_auth_state', state);

  const params = new URLSearchParams({
    client_id: SPOTIFY_CONFIG.clientId,
    response_type: 'code',
    redirect_uri: SPOTIFY_CONFIG.redirectUri,
    state: state,
    scope: SPOTIFY_CONFIG.scopes.join(' ')
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

export async function handleSpotifyCallback(code: string, state: string) {
  const storedState = localStorage.getItem('spotify_auth_state');
  
  // Decode state before comparing
  if (decodeURIComponent(state) !== storedState) {
    throw new Error('Invalid state parameter');
  }

  // Clear stored state
  localStorage.removeItem('spotify_auth_state');

  // Validate required config
  if (!SPOTIFY_CONFIG.clientId || !SPOTIFY_CONFIG.clientSecret) {
    throw new Error('Missing Spotify credentials');
  }

  // Exchange code for tokens
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(encodeURIComponent(SPOTIFY_CONFIG.clientId) + ':' + encodeURIComponent(SPOTIFY_CONFIG.clientSecret))}`
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: encodeURIComponent(code),
      redirect_uri: encodeURIComponent(SPOTIFY_CONFIG.redirectUri)
    })
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for tokens');
  }

  const data = await response.json();
  
  // Calculate expiration time
  const tokenExpiresAt = new Date();
  tokenExpiresAt.setSeconds(tokenExpiresAt.getSeconds() + data.expires_in);

  // Store tokens in database
  const { error } = await supabase
    .from('spotify_connections')
    .upsert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: tokenExpiresAt.toISOString()
    });

  if (error) throw error;
  
  // Initialize API client
  initializeApi(data.access_token);
  return true;
}

export async function refreshTokenIfNeeded(): Promise<void> {
  try {
    const token = await getSpotifyToken();
    if (token) {
      initializeApi(token);
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
  }
}

export async function disconnectSpotify() {
  const { error } = await supabase
    .from('spotify_connections')
    .delete()
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

  if (error) throw error;
  return true;
}