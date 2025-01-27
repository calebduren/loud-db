import SpotifyWebApi from 'spotify-web-api-js';

type SpotifyApi = SpotifyWebApi.SpotifyWebApiJs;

let spotifyApi: SpotifyApi | null = null;
let errorCallback: ((error: { status: number }) => void) | null = null;

export function initializeApi(accessToken: string, onError?: (error: { status: number }) => void) {
  spotifyApi = new SpotifyWebApi();
  if (accessToken) {
    spotifyApi.setAccessToken(accessToken);
  }
  errorCallback = onError || null;
}

export function getSpotifyApi(): SpotifyApi {
  if (!spotifyApi) {
    throw new Error("Spotify API not initialized");
  }
  return spotifyApi;
}

export async function makeSpotifyRequest<T>(request: () => Promise<T>): Promise<T> {
  if (!spotifyApi) {
    throw new Error("Spotify API not initialized");
  }
  
  try {
    return await request();
  } catch (error: any) {
    if (errorCallback && error.status) {
      await errorCallback(error);
    }
    throw error;
  }
}

export async function getTopTracks() {
  return makeSpotifyRequest(() => 
    getSpotifyApi().getMyTopTracks({ limit: 50, time_range: "short_term" })
  );
}

// Add other Spotify API functions here

// Re-export the SpotifyWebApi class for type information
export { SpotifyWebApi };