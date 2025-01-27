import SpotifyWebApi from "spotify-web-api-js";
import { logger } from "../utils/logger";

type SpotifyApi = SpotifyWebApi.SpotifyWebApiJs;

let spotifyApi: SpotifyApi | null = null;
let errorCallback: ((error: { status: number }) => void) | null = null;

export function initializeApi(accessToken: string, onError?: (error: { status: number }) => void) {
  if (!accessToken) {
    logger.warn('Attempting to initialize Spotify API without access token');
    return;
  }

  if (!spotifyApi) {
    spotifyApi = new SpotifyWebApi();
  }
  
  spotifyApi.setAccessToken(accessToken);
  errorCallback = onError || null;
}

export function getSpotifyApi(): SpotifyApi {
  if (!spotifyApi?.getAccessToken()) {
    throw new Error("Spotify API not initialized or missing access token");
  }
  return spotifyApi;
}

export async function makeSpotifyRequest<T>(request: () => Promise<T>): Promise<T> {
  if (!spotifyApi?.getAccessToken()) {
    throw new Error("Spotify API not initialized or missing access token");
  }
  
  try {
    return await request();
  } catch (error: any) {
    // Handle specific error cases
    if (error.status === 401) {
      logger.error('Spotify API authentication failed. Token may be expired.');
      if (errorCallback) {
        await errorCallback(error);
      }
    } else if (error.status === 429) {
      logger.warn('Spotify API rate limit exceeded. Backing off...');
      // Could add retry logic here
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