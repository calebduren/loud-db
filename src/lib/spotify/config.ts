import SpotifyWebApi from 'spotify-web-api-js';

// Create a single instance of the Spotify API client
export const spotifyApi = new SpotifyWebApi();

// Spotify application credentials
export const SPOTIFY_CONFIG = {
  clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
  clientSecret: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
};

// Get client credentials token
export async function getSpotifyToken(): Promise<string> {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${SPOTIFY_CONFIG.clientId}:${SPOTIFY_CONFIG.clientSecret}`)}`
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  if (!data.access_token) {
    throw new Error('Failed to get Spotify access token');
  }

  // Set the token on the API instance
  spotifyApi.setAccessToken(data.access_token);
  
  return data.access_token;
}