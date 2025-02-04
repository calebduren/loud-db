import React from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface SpotifyConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  loading: boolean;
}

export function SpotifyConnectModal({ 
  isOpen, 
  onClose, 
  isConnected,
  onConnect,
  onDisconnect,
  loading 
}: SpotifyConnectModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isConnected ? "Disconnect from Spotify" : "Connect to Spotify"}
    >
      <div className="space-y-6">
        <p className="text-white/60 text-sm">
          {isConnected
            ? "Are you sure you want to disconnect your Spotify account? This will remove access to your Spotify listening history and personalized recommendations."
            : "Connect your Spotify account to get personalized release recommendations based on your listening history."}
        </p>

        <Button
          variant="primary"
          onClick={isConnected ? onDisconnect : onConnect}
          disabled={loading}
          className="w-full"
        >
          {loading
            ? "Loading..."
            : isConnected
            ? "Disconnect Spotify"
            : "Connect Spotify"}
        </Button>
      </div>
    </Modal>
  );
}
