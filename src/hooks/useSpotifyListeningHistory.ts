import { useState, useEffect } from 'react';
import { useSpotifyConnection } from './useSpotifyConnection';
import { getUserTopArtists, getUserTopTracks, UserTopArtists, UserTopTracks } from '../lib/spotify/user';
import { logger } from '../lib/utils/logger';

export interface SpotifyListeningHistory {
  topArtists: UserTopArtists[];
  topTracks: UserTopTracks[];
  loading: boolean;
  error: Error | null;
}

export function useSpotifyListeningHistory(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'): SpotifyListeningHistory {
  const [topArtists, setTopArtists] = useState<UserTopArtists[]>([]);
  const [topTracks, setTopTracks] = useState<UserTopTracks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isConnected } = useSpotifyConnection();

  useEffect(() => {
    if (!isConnected) {
      setLoading(false);
      return;
    }

    async function fetchListeningHistory() {
      try {
        setLoading(true);
        setError(null);

        const [artists, tracks] = await Promise.all([
          getUserTopArtists(timeRange),
          getUserTopTracks(timeRange)
        ]);

        setTopArtists(artists);
        setTopTracks(tracks);
      } catch (err) {
        logger.error('Failed to fetch Spotify listening history', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchListeningHistory();
  }, [isConnected, timeRange]);

  return {
    topArtists,
    topTracks,
    loading,
    error
  };
}
