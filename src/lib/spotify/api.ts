import SpotifyWebApi from 'spotify-web-api-js';

const spotifyApi = new SpotifyWebApi();

export function initializeApi(token: string) {
  spotifyApi.setAccessToken(token);
}

export { spotifyApi };