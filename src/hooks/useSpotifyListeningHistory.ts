import { useState, useEffect } from 'react';
import { useSpotifyConnection } from './useSpotifyConnection';
import { getUserTopArtists, getUserTopTracks, UserTopArtists, UserTopTracks } from '../lib/spotify/user';
import { logger } from '../lib/utils/logger';
import { initializeApi } from '../lib/spotify/api'; // Assuming initializeApi is defined in this file

export interface SpotifyListeningHistory {
  topArtists: UserTopArtists[];
  topTracks: UserTopTracks[];
  loading: boolean;
  error: Error | null;
}

export function useSpotifyListeningHistory(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'): SpotifyListeningHistory {
  const [topArtists, setTopArtists] = useState<UserTopArtists[]>([]);
  const [topTracks, setTopTracks] = useState<UserTopTracks[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { isConnected, accessToken } = useSpotifyConnection();

  useEffect(() => {
    if (!isConnected || !accessToken) {
      setLoading(false);
      setTopArtists([]);
      setTopTracks([]);
      return;
    }

    async function fetchListeningHistory() {
      try {
        setLoading(true);
        setError(null);

        initializeApi(accessToken);

        const [artists, tracks] = await Promise.all([
          getUserTopArtists(timeRange),
          getUserTopTracks(timeRange)
        ]);

        setTopArtists(artists);
        setTopTracks(tracks);
      } catch (err) {
        logger.error('Failed to fetch Spotify listening history', err);
        setTopArtists([]);
        setTopTracks([]);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchListeningHistory();
  }, [isConnected, accessToken, timeRange]);

  return {
    topArtists,
    topTracks,
    loading,
    error
  };
}
