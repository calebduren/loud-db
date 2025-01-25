import { Handler } from '@netlify/functions';

async function getSpotifyToken() {
  if (!process.env.VITE_SPOTIFY_CLIENT_ID || !process.env.VITE_SPOTIFY_CLIENT_SECRET) {
    throw new Error('Spotify credentials not configured');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${process.env.VITE_SPOTIFY_CLIENT_ID}:${process.env.VITE_SPOTIFY_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Failed to get Spotify token:', error);
    throw new Error(`Failed to get Spotify token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { name } = JSON.parse(event.body || '{}');
    if (!name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Artist name is required' }),
      };
    }

    console.log('Searching for artist:', name);
    const token = await getSpotifyToken();
    
    // Search for the artist
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(name)}&type=artist&limit=1`;
    console.log('Spotify search URL:', searchUrl);
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!searchResponse.ok) {
      const error = await searchResponse.text();
      console.error('Spotify search failed:', error);
      throw new Error(`Failed to search Spotify: ${error}`);
    }

    const searchData = await searchResponse.json();
    console.log('Spotify search response:', JSON.stringify(searchData, null, 2));
    
    const artist = searchData.artists?.items[0];

    if (!artist) {
      return {
        statusCode: 404,
        body: JSON.stringify({ 
          error: 'Artist not found',
          searchTerm: name,
          results: searchData.artists?.items || []
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        id: artist.id,
        name: artist.name,
        genres: artist.genres || [],
      }),
    };
  } catch (error) {
    console.error('Error in spotify-search-artist:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
    };
  }
};
