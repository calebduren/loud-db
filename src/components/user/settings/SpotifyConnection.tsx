import React from 'react';
import { useSpotifyConnection } from '../../../hooks/useSpotifyConnection';
import { Button } from '../../ui/Button';

export function SpotifyConnection() {
  const { isConnected, connect, disconnect, loading } = useSpotifyConnection();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Spotify Connection</h3>
          <p className="text-sm text-gray-500">
            Connect your Spotify account to enhance your release recommendations based on your listening history
          </p>
        </div>
        {loading ? (
          <Button disabled>Loading...</Button>
        ) : isConnected ? (
          <Button onClick={disconnect} variant="secondary">Disconnect</Button>
        ) : (
          <Button onClick={connect}>Connect Spotify</Button>
        )}
      </div>
      {isConnected && (
        <div className="rounded-lg bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Your Spotify account is connected
              </p>
              <p className="mt-2 text-sm text-green-700">
                Your recommendations will now be enhanced based on your Spotify listening history
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
