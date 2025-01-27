import { supabase } from "../lib/supabase";
import { createRelease } from "../lib/releases/createRelease";
import { checkSpotifyDuplicate } from "../lib/validation/releaseValidation";
import { ReleaseType } from "../types/database";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to retry failed requests with exponential backoff
async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000,
  backoffFactor = 2
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await delay(delayMs);
      return retry(fn, retries - 1, delayMs * backoffFactor, backoffFactor);
    }
    throw error;
  }
}

async function getSpotifyToken() {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(
        `${import.meta.env.VITE_SPOTIFY_CLIENT_ID}:${
          import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
        }`
      )}`,
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to get Spotify token: ${data.error}`);
  }

  return data.access_token;
}

async function scrapeRedditForSpotifyLinks(maxPages = 5) {
  const spotifyLinks: string[] = [];
  const subreddits = ["indieheads", "hiphopheads", "electronicmusic"];

  for (const subreddit of subreddits) {
    try {
      console.log(`Fetching posts from r/${subreddit}...`);
      let after: string | null = null;
      let pageCount = 0;

      while (pageCount < maxPages) {
        // Construct URL with pagination
        const url = new URL(
          `https://www.reddit.com/r/${subreddit}/search.json`
        );
        url.searchParams.set("q", "fresh");
        url.searchParams.set("include_over_18", "on");
        url.searchParams.set("restrict_sr", "on");
        url.searchParams.set("t", "week");
        url.searchParams.set("sort", "new");
        url.searchParams.set("limit", "100");
        if (after) {
          url.searchParams.set("after", after);
        }

        const response = await fetch(url.toString(), {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/91.0.4472.124",
          },
        });

        if (!response.ok) {
          console.error(
            `Reddit API error for r/${subreddit}: ${response.status} ${response.statusText}`
          );
          break;
        }

        const data = await response.json();
        const posts = data.data?.children || [];
        console.log(
          `Found ${posts.length} posts on page ${
            pageCount + 1
          } for r/${subreddit}`
        );

        if (posts.length === 0) {
          break;
        }

        // Extract Spotify album links from posts
        posts.forEach((post: any) => {
          const title = post.data.title?.toLowerCase() || "";
          if (!title.includes("fresh")) {
            return;
          }

          console.log(`Found FRESH post in r/${subreddit}:`, title);

          const url = post.data.url;
          if (url && url.includes("open.spotify.com/album/")) {
            console.log("Found Spotify URL in post:", url);
            spotifyLinks.push(url);
          }

          const selftext = post.data.selftext || "";
          const matches = selftext.match(
            /https:\/\/open\.spotify\.com\/album\/[a-zA-Z0-9]+/g
          );
          if (matches) {
            console.log("Found Spotify URLs in post content:", matches);
            spotifyLinks.push(...matches);
          }
        });

        // Get the "after" token for the next page
        after = data.data?.after;
        if (!after) {
          console.log(`No more pages available for r/${subreddit}`);
          break;
        }

        pageCount++;

        // Add a small delay between pages to be nice to Reddit's API
        if (pageCount < maxPages) {
          await delay(2000);
        }
      }
    } catch (error) {
      console.error(`Error scraping r/${subreddit}:`, error);
      // Continue with the next subreddit even if this one fails
    }
  }

  const uniqueLinks = [...new Set(spotifyLinks)];
  console.log("Total unique Spotify links found:", uniqueLinks.length);
  return uniqueLinks;
}

// Process albums in batches to avoid overwhelming the API
async function processBatch(
  urls: string[],
  startIdx: number,
  batchSize: number,
  token: string,
  userId: string,
  onProgress: (progress: ImportProgress) => void
) {
  const batch = urls.slice(startIdx, startIdx + batchSize);
  const progress: ImportProgress = {
    stage: "importing",
    current: startIdx,
    total: urls.length,
    errors: [],
    skipped: [],
    created: [],
  };

  for (const url of batch) {
    try {
      // Get album ID from URL first so we can fetch details even for duplicates
      const albumId = url.split("/album/")[1].split("?")[0];

      // Fetch album details from Spotify
      const response = await retry(
        async () => {
          const res = await fetch(
            `https://api.spotify.com/v1/albums/${albumId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!res.ok) {
            throw new Error(`Failed to fetch album: ${res.statusText}`);
          }
          return res.json();
        },
        3,
        1000
      );

      console.log("Spotify album response:", {
        name: response.name,
        artists: response.artists.map((a: any) => a.name),
        genres: response.genres,
        album_type: response.album_type,
      });

      // Update progress
      progress.current = startIdx + batch.indexOf(url) + 1;
      progress.currentUrl = `${response.artists[0]?.name} - ${response.name}`;
      onProgress(progress);

      // Check for duplicates
      const isDuplicate = await retry(
        () => checkSpotifyDuplicate(url),
        3,
        2000
      );

      if (isDuplicate) {
        console.log(`Skipping duplicate album: ${response.name}`);
        progress.skipped.push(
          `${response.artists[0]?.name} - ${response.name}`
        );
        onProgress(progress);
        continue;
      }

      // Determine release type based on track count
      let releaseType: ReleaseType = "LP";
      if (response.tracks.total <= 4) {
        releaseType = "single";
      } else if (response.tracks.total <= 6) {
        releaseType = "EP";
      }

      // Let's try to get artist genres if album has no genres
      let genres = response.genres || [];
      if (genres.length === 0 && response.artists?.length > 0) {
        console.log("Album has no genres, fetching from artist...");
        try {
          const artistId = response.artists[0].id;
          const artistResponse = await retry(
            async () => {
              const res = await fetch(
                `https://api.spotify.com/v1/artists/${artistId}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              if (!res.ok) {
                throw new Error(`Failed to fetch artist: ${res.statusText}`);
              }
              return res.json();
            },
            3,
            1000
          );

          if (artistResponse.genres?.length > 0) {
            console.log("Found genres from artist:", artistResponse.genres);
            genres = artistResponse.genres;
          }
        } catch (error) {
          console.error("Error fetching artist genres:", error);
        }
      }

      // Create the release
      await createRelease({
        name: response.name,
        release_type: releaseType,
        cover_url: response.images[0]?.url || "",
        genres: genres,
        record_label: response.label || "Unknown",
        track_count: response.tracks.total,
        spotify_url: url,
        release_date: response.release_date,
        created_by: userId,
        artists: response.artists.map((artist: any) => ({
          name: artist.name,
        })),
        tracks: response.tracks.items.map((track: any) => ({
          name: track.name,
          duration_ms: track.duration_ms || 0,
          track_number: track.track_number || 1,
          preview_url: track.preview_url || null,
        })),
      });

      progress.created.push(`${response.artists[0]?.name} - ${response.name}`);
      onProgress(progress);
    } catch (error) {
      console.error(`Error processing album ${url}:`, error);
      progress.errors.push(
        `Failed to import ${url}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      onProgress(progress);
    }
  }
}

export interface ImportProgress {
  stage: "fetching" | "importing" | "complete";
  current: number;
  total: number;
  currentUrl?: string;
  errors: string[];
  skipped: string[];
  created: string[];
}

export async function importFromReddit(
  userId: string,
  onProgress?: (progress: ImportProgress) => void
) {
  const defaultProgress = (progress: ImportProgress) => {
    console.log(
      `Progress: ${progress.current}/${progress.total} ${progress.stage}`,
      progress.currentUrl ? `Current: ${progress.currentUrl}` : ""
    );
  };

  const progress: ImportProgress = {
    stage: "fetching",
    current: 0,
    total: 0,
    errors: [],
    skipped: [],
    created: [],
  };

  try {
    // Get Spotify token first
    const token = await getSpotifyToken();

    // Update progress
    progress.stage = "fetching";
    onProgress?.(progress);

    // Scrape Reddit for Spotify links
    const spotifyUrls = await scrapeRedditForSpotifyLinks();

    if (!spotifyUrls.length) {
      throw new Error("No Spotify links found on Reddit");
    }

    // Update progress with total
    progress.stage = "importing";
    progress.total = spotifyUrls.length;
    onProgress?.(progress);

    // Process in batches of 3
    const batchSize = 3;
    for (let i = 0; i < spotifyUrls.length; i += batchSize) {
      await processBatch(
        spotifyUrls,
        i,
        batchSize,
        token,
        userId,
        onProgress || defaultProgress
      );
    }

    // Final progress update
    progress.stage = "complete";
    progress.current = spotifyUrls.length;
    onProgress?.(progress);

    return {
      created: progress.created.length,
      skipped: progress.skipped.length,
      errors: progress.errors.length,
      createdAlbums: progress.created,
    };
  } catch (error) {
    console.error("Error in importFromReddit:", error);
    throw error;
  }
}
