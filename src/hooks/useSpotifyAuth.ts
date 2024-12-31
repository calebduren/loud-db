import { useEffect } from 'react';
import { useSpotifyConnection } from './useSpotifyConnection';
import { getSpotifyToken } from '../lib/spotify/auth';
import { useToast } from './useToast';

export function useSpotifyAuth() {
  const { isConnected } = useSpotifyConnection();
  const { showToast } = useToast();

  useEffect(() => {
    async function initSpotify() {
      if (!isConnected) return;
      
      try {
        const token = await getSpotifyToken();
        if (!token) {
          throw new Error('Failed to get Spotify token');
        }
      } catch (error) {
        console.error('Failed to initialize Spotify:', error);
        showToast({
          type: 'error',
          message: 'Failed to connect to Spotify. Please try reconnecting in settings.'
        });
      }
    }

    initSpotify();
  }, [isConnected, showToast]);
}