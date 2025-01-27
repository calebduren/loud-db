import React from "react";
import { useSpotifyConnection } from "../../../hooks/useSpotifyConnection";
import { Button } from "../../ui/button";

export function SpotifyConnection() {
  const { isConnected, loading, connect, disconnect } = useSpotifyConnection();

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        Connect to Spotify
      </h2>

      <div className="space-y-6">
        <p className="text-white/60 text-sm">
          Connect your Spotify account to get personalized release
          recommendations based on your listening history.
        </p>

        <Button 
          variant="primary" 
          onClick={isConnected ? disconnect : connect}
          disabled={loading}
        >
          {loading ? "Loading..." : isConnected ? "Disconnect Spotify" : "Connect Spotify"}
        </Button>
      </div>
    </div>
  );
}
