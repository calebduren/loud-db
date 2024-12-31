import React from 'react';
import { Music2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { useSpotifyConnection } from '../../../hooks/useSpotifyConnection';
import { initiateSpotifyAuth, disconnectSpotify } from '../../../lib/spotify/auth';
import { useToast } from '../../../hooks/useToast';

export function SpotifySettings() {
  const { isConnected, loading, checkConnection } = useSpotifyConnection();
  const { showToast } = useToast();
  const [disconnecting, setDisconnecting] = React.useState(false);

  const handleConnect = async () => {
    try {
      await initiateSpotifyAuth();
    } catch (error) {
      console.error('Error initiating Spotify auth:', error);
      showToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to connect to Spotify'
      });
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await disconnectSpotify();
      await checkConnection();
      showToast({
        type: 'success',
        message: 'Spotify account disconnected successfully'
      });
    } catch (error) {
      console.error('Error disconnecting Spotify:', error);
      showToast({
        type: 'error',
        message: 'Failed to disconnect Spotify account'
      });
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <Music2 className="w-5 h-5" />
        Spotify Integration
      </h2>

      <div className="space-y-4">
        <p className="text-white/60">
          Connect your Spotify account to personalize your music recommendations
          based on your listening history.
        </p>

        {loading ? (
          <div>Loading...</div>
        ) : isConnected ? (
          <div className="space-y-4">
            <div className="bg-green-500/10 text-green-500 p-4 rounded-lg">
              Your Spotify account is connected
            </div>
            <Button
              variant="destructive"
              onClick={handleDisconnect}
              disabled={disconnecting}
            >
              {disconnecting ? 'Disconnecting...' : 'Disconnect Spotify'}
            </Button>
          </div>
        ) : (
          <Button onClick={handleConnect}>
            Connect Spotify
          </Button>
        )}
      </div>
    </div>
  );
}