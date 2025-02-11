import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import { importFromReddit } from "../../../src/api/reddit";

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function isAdmin(userId: string): Promise<boolean> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  return profile?.role === "admin";
}

async function processSpotifyUrl(url: string, token: string) {
  try {
    // Extract album ID from URL
    const albumId = url.split('/album/')[1]?.split('?')[0];
    if (!albumId) {
      throw new Error('Invalid Spotify URL');
    }

    // Fetch album data from Spotify
    const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    const album = await response.json();

    // Try to get Apple Music URL
    let appleMusicUrl = null;
    try {
      appleMusicUrl = await getAppleMusicUrl(url);
    } catch (error) {
      console.error('Error fetching Apple Music URL:', error);
    }

    // Upload cover image to storage
    let coverUrl = null;
    if (album.images?.[0]?.url) {
      coverUrl = await uploadImageFromUrl(album.images[0].url);
    }

    // Return processed data
    return {
      name: album.name,
      release_type: album.album_type === 'single' ? 'single' : 'LP',
      cover_url: coverUrl,
      record_label: album.label,
      track_count: album.tracks.total,
      spotify_url: url,
      apple_music_url: appleMusicUrl,
      release_date: album.release_date,
      genres: album.genres || [],
      artists: album.artists.map((artist: any) => ({
        name: artist.name,
      })),
    };
  } catch (error) {
    console.error(`Error processing Spotify URL ${url}:`, error);
    throw error;
  }
}

export const handler: Handler = async (event) => {
  // Enable CORS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  try {
    // Get user ID from Authorization header
    const authHeader = event.headers.authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "No authorization header" }),
      };
    }

    // Verify user with Supabase
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Unauthorized" }),
      };
    }

    // Check if user is admin
    if (!(await isAdmin(user.id))) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "Forbidden: User is not an admin" }),
      };
    }

    // Import from Reddit with progress tracking
    const result = await importFromReddit(user.id, (progress) => {
      // Log progress to CloudWatch/Netlify logs
      console.log('Import progress:', progress);
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error("Import failed:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};
