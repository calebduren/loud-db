import { Release } from '../types/database';

interface GenreScore {
  [genre: string]: number;
}

interface ArtistScore {
  [artistId: string]: number;
}

export function calculateUserPreferences(likedReleases: Release[]) {
  const genreScores: GenreScore = {};
  const artistScores: ArtistScore = {};

  likedReleases.forEach(release => {
    // Calculate genre preferences
    release.genres.forEach(genre => {
      genreScores[genre] = (genreScores[genre] || 0) + 1;
    });

    // Calculate artist preferences
    release.artists.forEach(({ artist }) => {
      artistScores[artist.id] = (artistScores[artist.id] || 0) + 1;
    });
  });

  return { genreScores, artistScores };
}