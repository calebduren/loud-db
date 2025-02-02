import React from "react";
import { Dialog } from "@headlessui/react";
import { Button } from "../ui/button";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

interface SpotifyConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
}

export function SpotifyConnectModal({ isOpen, onClose, isConnected }: SpotifyConnectModalProps) {
  const handleConnect = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // TODO: Implement Spotify OAuth connection
    // This should redirect to Spotify's OAuth flow
    console.log("Connecting to Spotify...");
  };

  const handleDisconnect = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // TODO: Implement Spotify disconnect
      // This should revoke the Spotify OAuth token and update the user's profile
      console.log("Disconnecting from Spotify...");
      
      toast.success("Successfully disconnected from Spotify");
      onClose();
    } catch (error) {
      console.error("Error disconnecting from Spotify:", error);
      toast.error("Failed to disconnect from Spotify");
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-[var(--color-background)] p-6 shadow-xl">
          <Dialog.Title className="text-lg font-medium mb-4">
            {isConnected ? "Spotify Connected" : "Connect to Spotify"}
          </Dialog.Title>

          <p className="text-white/60 mb-6">
            {isConnected 
              ? "Your Spotify account is currently connected. You can disconnect it at any time."
              : "Connect your Spotify account to enable music playback and playlist features."
            }
          </p>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            {isConnected ? (
              <Button variant="destructive" onClick={handleDisconnect}>
                Disconnect
              </Button>
            ) : (
              <Button onClick={handleConnect}>
                Connect Spotify
              </Button>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
