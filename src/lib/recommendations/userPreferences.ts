import { Release } from '../types/database';
import { UserTopArtists, UserTopTracks } from '../spotify/user';
import { Preferences } from './releaseScoring';

export function calculateUserPreferences(
  likedReleases: Release[],
  spotifyHistory?: {
    topArtists: UserTopArtists[];
    topTracks: UserTopTracks[];
  }
): Preferences {
  const preferences: Preferences = {
    genreScores: {},
    artistScores: {},
    spotifyGenreScores: {},
    spotifyArtistScores: {}
  };
  
  // Calculate scores from liked releases
  likedReleases?.forEach(release => {
    // Add genre preferences
    release.genres?.forEach(genre => {
      preferences.genreScores[genre] = (preferences.genreScores[genre] || 0) + 1;
    });
    
    // Add artist preferences
    release.artists?.forEach(({ artist }) => {
      preferences.artistScores[artist.id] = (preferences.artistScores[artist.id] || 0) + 1;
    });
  });

  // Calculate scores from Spotify listening history if available
  if (spotifyHistory) {
    // Process top artists
    spotifyHistory.topArtists.forEach((artist, index) => {
      // Score is inversely proportional to position (50 - index) to give higher weights to top artists
      const score = (50 - index) / 50;
      
      // Add artist score
      preferences.spotifyArtistScores![artist.id] = score;
      
      // Add genre scores
      artist.genres.forEach(genre => {
        preferences.spotifyGenreScores![genre] = 
          (preferences.spotifyGenreScores![genre] || 0) + score;
      });
    });

    // Process top tracks for additional genre information
    spotifyHistory.topTracks.forEach((track, index) => {
      const score = (50 - index) / 50;
      
      // Add artist scores
      track.artists.forEach(artist => {
        preferences.spotifyArtistScores![artist.id] = 
          Math.max(preferences.spotifyArtistScores![artist.id] || 0, score);
      });
      
      // Add album genre scores if available
      track.album.genres.forEach(genre => {
        preferences.spotifyGenreScores![genre] = 
          (preferences.spotifyGenreScores![genre] || 0) + score;
      });
    });

    // Normalize Spotify scores
    normalizeScores(preferences.spotifyGenreScores!);
    normalizeScores(preferences.spotifyArtistScores!);
  }

  return preferences;
}

function normalizeScores(scores: { [key: string]: number }) {
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore > 0) {
    Object.keys(scores).forEach(key => {
      scores[key] = scores[key] / maxScore;
    });
  }
}