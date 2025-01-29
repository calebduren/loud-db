import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "./useToast";
import { initializeApi } from "../lib/spotify/api";

interface SpotifyConnection {
  id: string;
  user_id: string;
  spotify_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  created_at: string;
}

const SPOTIFY_SCOPES = [
  "user-top-read",
  "user-read-recently-played",
  "user-library-read",
].join(" ");

export function useSpotifyConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();
  const hasShownToastRef = useRef(false);

  // Add refreshToken function
  const refreshToken = async (connection: SpotifyConnection) => {
    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${btoa(`${import.meta.env.VITE_SPOTIFY_CLIENT_ID}:${import.meta.env.VITE_SPOTIFY_CLIENT_SECRET}`)}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: connection.refresh_token,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh token: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Calculate new expiration (default to 1 hour if not provided)
      const newExpiresAt = new Date();
      newExpiresAt.setSeconds(newExpiresAt.getSeconds() + (data.expires_in || 3600));

      // Update the connection with new tokens
      const { error: updateError } = await supabase
        .from('spotify_connections')
        .update({
          access_token: data.access_token,
          expires_at: newExpiresAt.toISOString(),
          ...(data.refresh_token && { refresh_token: data.refresh_token }),
        })
        .eq('user_id', connection.user_id);

      if (updateError) throw updateError;

      return data.access_token;
    } catch (error) {
      console.error("[Spotify] Error refreshing token:", error);
      throw error;
    }
  };

  // Track if we're intentionally disconnecting
  const disconnectingRef = useRef(false);

  // Check connection status on mount and after auth changes
  useEffect(() => {
    if (!user || disconnectingRef.current) return;

    async function checkConnection() {
      try {
        setLoading(true);
        const { data: connection } = await supabase
          .from('spotify_connections')
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        console.log("[Spotify] Checking connection:", { connection });

        if (!connection) {
          console.log("[Spotify] No connection found, clearing state");
          setIsConnected(false);
          hasShownToastRef.current = false;
          initializeApi("");
        } else {
          console.log("[Spotify] Connection found, initializing");
          setIsConnected(true);
          hasShownToastRef.current = true;
          initializeApi(connection.access_token);
        }
      } catch (error) {
        console.error("[Spotify] Error checking connection:", error);
        setIsConnected(false);
        hasShownToastRef.current = false;
        initializeApi("");
      } finally {
        setLoading(false);
      }
    }

    checkConnection();
  }, [user]);

  // Handle Spotify connection
  const connect = async () => {
    if (!user) {
      showToast({
        type: "error",
        message: "You must be logged in to connect Spotify",
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "spotify",
        options: {
          redirectTo: `${window.location.origin}/account`,
          scopes: SPOTIFY_SCOPES,
          skipBrowserRedirect: false,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("[Spotify] Error connecting:", error);
      setLoading(false);
      showToast({
        type: "error",
        message: "Failed to connect to Spotify",
      });
    }
  };

  // Handle disconnection
  const disconnect = async () => {
    if (!user) return;

    try {
      console.log("[Spotify] Starting disconnect");
      setLoading(true);
      disconnectingRef.current = true;

      // Delete our connection record
      const { error } = await supabase
        .from('spotify_connections')
        .delete()
        .eq("user_id", user.id);

      if (error) {
        console.error("[Spotify] Error deleting connection:", error);
        throw error;
      }

      console.log("[Spotify] Connection deleted, clearing state");
      
      // Clear local state
      initializeApi("");
      setIsConnected(false);
      hasShownToastRef.current = false;

      // Sign out of Spotify provider
      await supabase.auth.signOut();

      showToast({
        type: "success",
        message: "Successfully disconnected from Spotify",
      });
    } catch (error) {
      console.error("[Spotify] Error disconnecting:", error);
      showToast({
        type: "error",
        message: "Failed to disconnect from Spotify",
      });
    } finally {
      setLoading(false);
      disconnectingRef.current = false;
    }
  };

  // Handle auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[Spotify] Auth state change:", { event, hasToken: !!session?.provider_token });
      
      // Only handle initial session and sign in events
      if (event !== 'INITIAL_SESSION' && event !== 'SIGNED_IN') {
        return;
      }

      // Skip if no token or if we're disconnecting
      if (!session?.provider_token || disconnectingRef.current) {
        return;
      }

      try {
        // Check Spotify API first
        const response = await fetch("https://api.spotify.com/v1/me", {
          headers: { Authorization: `Bearer ${session.provider_token}` },
        });

        // If unauthorized, clear connection
        if (response.status === 401) {
          console.log("[Spotify] Unauthorized, clearing state");
          setIsConnected(false);
          hasShownToastRef.current = false;
          initializeApi("");
          return;
        }

        if (!response.ok) throw new Error(`Failed to fetch profile: ${response.statusText}`);

        const spotifyUser = await response.json();
        const expiresAt = new Date(Date.now() + 3600000).toISOString();

        // Check if we have a connection in the database
        const { data: connection } = await supabase
          .from('spotify_connections')
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle();

        console.log("[Spotify] Current connection:", { connection });

        if (connection) {
          // Update existing connection
          const { error: updateError } = await supabase
            .from('spotify_connections')
            .update({
              access_token: session.provider_token,
              refresh_token: session.provider_refresh_token || null,
              expires_at: expiresAt,
            })
            .eq("user_id", session.user.id);

          if (updateError) throw updateError;
        } else {
          // Create new connection
          const { error: insertError } = await supabase
            .from('spotify_connections')
            .insert({
              user_id: session.user.id,
              spotify_id: spotifyUser.id,
              access_token: session.provider_token,
              refresh_token: session.provider_refresh_token || null,
              expires_at: expiresAt,
            })
            .select()
            .single();

          if (insertError) throw insertError;

          showToast({
            type: "success",
            message: "Successfully connected to Spotify!",
          });
        }

        // Update local state after database is updated
        initializeApi(session.provider_token);
        setIsConnected(true);
        hasShownToastRef.current = true;
      } catch (error) {
        console.error("[Spotify] Connection error:", error);
        if (!isConnected) {
          showToast({
            type: "error",
            message: "Failed to connect to Spotify",
          });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isConnected, showToast]);

  return { isConnected, loading, connect, disconnect };
}
