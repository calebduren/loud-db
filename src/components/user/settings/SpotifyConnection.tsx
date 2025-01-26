import React from "react";
import { useSpotifyConnection } from "../../../hooks/useSpotifyConnection";
import { Button } from "../../ui/button";
import { Loader2 } from "lucide-react";

export function SpotifyConnection() {
  const { isConnected, loading, connect, disconnect } = useSpotifyConnection();

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        Connect to Spotify
      </h2>

      <div className="space-y-6">
        <p className="text-white/60 text-sm">
          {isConnected
            ? "Your Spotify account is connected and being used to personalize recommendations based on your listening history."
            : "Connect your Spotify account to get personalized release recommendations based on your listening history."}
        </p>

        {loading ? (
          <Button variant="primary" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </Button>
        ) : isConnected ? (
          <Button variant="destructive" onClick={disconnect}>
            Disconnect Spotify
          </Button>
        ) : (
          <Button variant="primary" onClick={connect}>
            Connect Spotify
          </Button>
        )}
      </div>
    </div>
  );
}
