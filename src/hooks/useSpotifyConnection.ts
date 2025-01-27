import { useState, useEffect } from "react";
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
  const { user } = useAuth();
  const { showToast } = useToast();

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

  // Check if we're already connected
  useEffect(() => {
    async function checkConnection() {
      if (!user) {
        setIsConnected(false);
        setLoading(false);
        return;
      }

      try {
        const { data: connection, error } = await supabase
          .from('spotify_connections')
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (connection?.access_token) {
          // Initialize with current token
          initializeApi(connection.access_token, async (error) => {
            // If we get a 401, try to refresh the token
            if (error?.status === 401) {
              try {
                const newToken = await refreshToken(connection);
                initializeApi(newToken);
                setIsConnected(true);
              } catch (refreshError) {
                console.error("[Spotify] Failed to refresh token:", refreshError);
                await disconnect();
              }
            }
          });
          setIsConnected(true);
        } else {
          initializeApi("");
          setIsConnected(false);
        }
      } catch (error) {
        console.error("[Spotify] Error checking connection:", error);
        setIsConnected(false);
        initializeApi("");
      } finally {
        setLoading(false);
      }
    }

    checkConnection();
  }, [user?.id]);

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
      setLoading(true);
      const { error } = await supabase
        .from('spotify_connections')
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      initializeApi("");
      setIsConnected(false);
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
    }
  };

  // Handle auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[Spotify] Auth state changed:", event);
      console.log("[Spotify] Has provider token:", !!session?.provider_token);
      console.log("[Spotify] Has refresh token:", !!session?.provider_refresh_token);
      console.log("[Spotify] Session:", session);

      if (event === 'INITIAL_SESSION' && session?.provider_token) {
        try {
          console.log("[Spotify] Processing initial session with token");
          
          // Get Spotify user info
          const response = await fetch("https://api.spotify.com/v1/me", {
            headers: {
              Authorization: `Bearer ${session.provider_token}`,
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error("[Spotify] Profile fetch error:", errorText);
            throw new Error(`Failed to fetch Spotify profile: ${response.statusText}`);
          }

          const spotifyUser = await response.json();
          console.log("[Spotify] Got user profile:", spotifyUser);

          // Calculate token expiration (default to 1 hour if not provided)
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + 1);

          // Delete any existing connections first
          await supabase
            .from('spotify_connections')
            .delete()
            .eq('user_id', session.user.id);

          // Create connection record with upsert
          const { error: insertError } = await supabase
            .from('spotify_connections')
            .upsert({
              user_id: session.user.id,
              spotify_id: spotifyUser.id,
              access_token: session.provider_token,
              refresh_token: session.provider_refresh_token || null,
              expires_at: expiresAt.toISOString(),
            }, {
              onConflict: 'user_id',
              ignoreDuplicates: false
            })
            .select()
            .single();

          if (insertError) {
            console.error("[Spotify] Insert error:", insertError);
            throw insertError;
          }

          console.log("[Spotify] Connection record created");
          initializeApi(session.provider_token);
          setIsConnected(true);
          showToast({
            type: "success",
            message: "Successfully connected to Spotify!",
          });
        } catch (error) {
          console.error("[Spotify] Connection error:", error);
          showToast({
            type: "error",
            message: error instanceof Error ? error.message : "Failed to connect to Spotify",
          });
        } finally {
          setLoading(false);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { isConnected, loading, connect, disconnect };
}
