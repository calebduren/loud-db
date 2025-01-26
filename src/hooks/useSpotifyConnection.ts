import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "./useToast";
import { useRetry } from "./useRetry";
import { initializeApi } from "../lib/spotify/api";

interface SpotifyConnection {
  id: string;
  user_id: string;
  spotify_id: string;
  access_token: string;
  refresh_token: string;
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
  const { executeWithRetry } = useRetry();

  const checkConnection = async () => {
    try {
      if (!user) {
        setIsConnected(false);
        setLoading(false);
        return;
      }

      const { data: connection, error } = await executeWithRetry<{
        data: SpotifyConnection | null;
        error: any;
      }>(() =>
        supabase
          .from<SpotifyConnection>('spotify_connections')
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle()
          .then(result => result)
      );

      if (error) throw error;

      if (connection?.access_token) {
        // Try to validate the token
        try {
          const response = await fetch("https://api.spotify.com/v1/me", {
            headers: {
              Authorization: `Bearer ${connection.access_token}`,
            },
          });
          
          if (!response.ok) {
            // Token might be expired, try to refresh
            const { data: session } = await supabase.auth.refreshSession();
            if (session?.session?.provider_token) {
              // Update the connection with new token
              const { error: updateError } = await supabase
                .from('spotify_connections')
                .update({
                  access_token: session.session.provider_token,
                  refresh_token: session.session.provider_refresh_token,
                })
                .eq("user_id", user.id);
                
              if (!updateError) {
                initializeApi(session.session.provider_token);
                setIsConnected(true);
                return;
              }
            }
            // If refresh failed, disconnect
            await disconnect();
            return;
          }
          
          initializeApi(connection.access_token);
          setIsConnected(true);
        } catch (error) {
          console.error("Error validating token:", error);
          await disconnect();
        }
      } else {
        initializeApi("");
        setIsConnected(false);
      }
    } catch (error) {
      console.error("Error checking Spotify connection:", error);
      setIsConnected(false);
      initializeApi("");
      showToast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to check Spotify connection",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, [user]);

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
      console.log("Starting Spotify OAuth flow...");
      
      // Start OAuth flow with PKCE
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "spotify",
        options: {
          redirectTo: `${window.location.origin}/preferences`,
          scopes: SPOTIFY_SCOPES,
        },
      });

      console.log("OAuth response:", { 
        hasData: !!data,
        hasUrl: !!data?.url,
        error: error || 'none',
      });

      if (error) {
        console.error("Supabase OAuth error:", error);
        throw error;
      }
      
      if (!data?.url) {
        console.error("No OAuth URL returned from Supabase");
        throw new Error("No OAuth URL returned");
      }

      console.log("Redirecting to Spotify OAuth URL:", data.url);
      window.location.href = data.url;
    } catch (error) {
      console.error("Error connecting to Spotify:", error);
      showToast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to connect to Spotify",
      });
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // First clear our local connection record
      const { error: deleteError } = await supabase
        .from<SpotifyConnection>('spotify_connections')
        .delete()
        .eq("user_id", user.id);

      if (deleteError) {
        console.error("Error deleting existing connection:", deleteError);
      }

      // Clear the Spotify API instance and state
      initializeApi("");
      setIsConnected(false);

      // Try to sign out of Spotify (but don't throw if it fails)
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.warn(
          "Failed to sign out of Spotify, but connection was removed:",
          signOutError
        );
      }

      showToast({
        type: "success",
        message: "Successfully disconnected Spotify",
      });
    } catch (error) {
      console.error("Error disconnecting Spotify:", error);
      showToast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to disconnect Spotify",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle OAuth response
  useEffect(() => {
    let isHandlingSession = false;

    const handleSpotifySession = async () => {
      console.log("Checking for Spotify callback...", {
        pathname: window.location.pathname,
        search: window.location.search,
        isHandlingSession,
        hasUser: !!user
      });

      if (isHandlingSession || !user) {
        console.log("Skipping session handling:", { isHandlingSession, hasUser: !!user });
        return;
      }

      try {
        // Get URL parameters
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        
        console.log("URL Parameters:", {
          code: code ? "present" : "missing",
          error: error || "none",
          allParams: Object.fromEntries(searchParams.entries())
        });

        // Only proceed if we have a code
        if (!code) {
          console.log("No code present, skipping callback handling");
          return;
        }

        console.log("Starting Spotify callback handling...");
        isHandlingSession = true;

        // Get the session directly - Supabase will handle the code exchange internally
        console.log("Getting session...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        console.log("Session result:", { 
          hasSession: !!session,
          hasProviderToken: !!session?.provider_token,
          error: sessionError || 'none'
        });

        if (sessionError) {
          throw sessionError;
        }

        if (!session?.provider_token) {
          throw new Error("No provider token in session");
        }

        // Delete any existing connections first
        console.log("Deleting existing connections...");
        await supabase
          .from('spotify_connections')
          .delete()
          .eq("user_id", user.id);

        // Get Spotify user info
        console.log("Fetching Spotify user info...");
        const response = await fetch("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Spotify API error:", errorText);
          throw new Error("Failed to fetch Spotify user info");
        }

        const spotifyUser = await response.json();
        console.log("Got Spotify user info:", spotifyUser);

        // Create new connection
        console.log("Creating new connection...");
        const { error: insertError } = await supabase
          .from('spotify_connections')
          .insert({
            user_id: user.id,
            spotify_id: spotifyUser.id,
            access_token: session.provider_token,
            refresh_token: session.provider_refresh_token,
          });

        if (insertError) {
          console.error("Error inserting connection:", insertError);
          throw insertError;
        }

        console.log("Successfully connected Spotify!");
        initializeApi(session.provider_token);
        setIsConnected(true);
        showToast({
          type: "success",
          message: "Successfully connected to Spotify",
        });

        // Clear the URL parameters after successful connection
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error("Error handling Spotify connection:", error);
        // Clean up on error
        await supabase
          .from('spotify_connections')
          .delete()
          .eq("user_id", user.id);
        initializeApi("");
        setIsConnected(false);
        showToast({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to handle Spotify connection",
        });
      } finally {
        isHandlingSession = false;
      }
    };

    handleSpotifySession();
  }, [user, window.location.search]);

  return {
    isConnected,
    loading,
    connect,
    disconnect,
  };
}
