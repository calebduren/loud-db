import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { fetchPlaylistAlbums } from "../../lib/spotify/playlist";
import { fetchReleaseFromSpotify } from "../../lib/spotify/client";
import { createRelease } from "../../lib/releases/createRelease";
import { useAuth } from "../../contexts/AuthContext";
import { SpotifyAlbum } from "../../lib/spotify/types/album";
import { AppError } from "../../lib/errors/messages";
import { checkSpotifyDuplicate } from "../../lib/validation/releaseValidation";

interface PlaylistImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ImportProgress {
  stage: "fetching" | "importing" | "complete";
  current: number;
  total: number;
  currentAlbum?: string;
  errors: string[];
  skipped: string[];
  created: string[];
}

// Helper function to delay between requests
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
      // Use exponential backoff for retries
      await delay(delayMs);
      return retry(fn, retries - 1, delayMs * backoffFactor, backoffFactor);
    }
    throw error;
  }
}

// Process albums in batches to avoid overwhelming the API
const processBatch = async (
  albums: SpotifyAlbum[],
  startIdx: number,
  batchSize: number,
  updateProgress: (current: number, album: string) => void,
  setProgress: React.Dispatch<React.SetStateAction<ImportProgress>>,
  user: any
) => {
  const batch = albums.slice(startIdx, startIdx + batchSize);

  for (const album of batch) {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Update progress
      updateProgress(startIdx + batch.indexOf(album) + 1, album.name);

      // Make sure we have a valid album with required fields
      if (!album?.external_urls?.spotify) {
        throw new Error(`Missing Spotify URL for album ${album.name}`);
      }

      // Check for duplicates
      const isDuplicate = await retry(
        () => checkSpotifyDuplicate(album.external_urls.spotify),
        3,
        2000
      );

      if (isDuplicate) {
        console.log(`Skipping duplicate album: ${album.name}`);
        setProgress((prev) => ({
          ...prev,
          skipped: [...prev.skipped, album.name],
        }));
        continue;
      }

      // Get full album details and ensure we have tracks
      const fullAlbum = await retry(
        () => fetchReleaseFromSpotify(album.external_urls.spotify),
        3,
        1000
      );

      if (!fullAlbum) {
        throw new Error(`Failed to fetch details for album ${album.name}`);
      }

      if (!fullAlbum.tracks || fullAlbum.tracks.length === 0) {
        console.warn(`No tracks found for album ${album.name}`);
      }

      // Create the release
      await retry(
        async () => {
          const coverUrl = album.images?.[0]?.url || fullAlbum.coverUrl;
          if (!coverUrl) {
            console.warn(`No cover image found for album ${album.name}`);
          }

          // Determine release type based on track count
          let releaseType: ReleaseType = "LP";
          const trackCount =
            fullAlbum.trackCount || fullAlbum.tracks?.length || 0;
          if (trackCount <= 3) {
            releaseType = "single";
          } else if (trackCount <= 6) {
            releaseType = "EP";
          }

          await createRelease({
            name: fullAlbum.name || album.name,
            release_type: releaseType,
            cover_url: coverUrl,
            genres: fullAlbum.genres || [],
            record_label: fullAlbum.recordLabel || album.label || "Unknown",
            track_count: trackCount,
            spotify_url: album.external_urls.spotify,
            release_date:
              fullAlbum.releaseDate || new Date().toISOString().split("T")[0],
            created_by: user.id,
            artists: (fullAlbum.artists || album.artists || []).map(
              (artist) => ({
                name: artist.name,
              })
            ),
            tracks: fullAlbum.tracks.map((track) => ({
              name: track.name,
              duration_ms: track.duration_ms || 0,
              track_number: track.track_number || 1,
              preview_url: track.preview_url || null,
            })),
          });
        },
        3,
        1000
      );

      setProgress((prev) => ({
        ...prev,
        created: [...prev.created, album.name],
      }));
    } catch (error) {
      console.error(`Error processing album ${album.name}:`, error);
      setProgress((prev) => ({
        ...prev,
        errors: [
          ...prev.errors,
          `Failed to import ${album.name}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        ],
      }));
    }
  }
};

export function PlaylistImportModal({
  isOpen,
  onClose,
  onSuccess,
}: PlaylistImportModalProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<ImportProgress>({
    stage: "fetching",
    current: 0,
    total: 0,
    errors: [],
    skipped: [],
    created: [],
  });
  const { user } = useAuth();

  const importAlbums = async (albums: SpotifyAlbum[]) => {
    setProgress((prev) => ({
      ...prev,
      stage: "importing",
      current: 0,
      total: albums.length,
      errors: [],
      skipped: [],
      created: [],
    }));

    // Process albums in batches of 3
    const BATCH_SIZE = 3;
    for (let i = 0; i < albums.length; i += BATCH_SIZE) {
      await processBatch(
        albums,
        i,
        BATCH_SIZE,
        (current, albumName) => {
          setProgress((prev) => ({
            ...prev,
            current,
            currentAlbum: albumName,
          }));
        },
        setProgress,
        user
      );
    }

    setProgress((prev) => ({
      ...prev,
      stage: "complete",
    }));
  };

  const handleImport = async () => {
    if (!user) {
      alert("You must be logged in to import playlists");
      return;
    }

    try {
      setLoading(true);
      setProgress({
        stage: "fetching",
        current: 0,
        total: 0,
        errors: [],
        skipped: [],
        created: [],
      });

      // Fetch all albums from playlist
      const albums = await fetchPlaylistAlbums(url);
      await importAlbums(albums);
    } catch (error) {
      if (error instanceof AppError) {
        if (error.message === "NOT_FOUND") {
          alert(
            "Playlist not found. Please check the URL and make sure the playlist is public."
          );
        } else if (error.message === "INVALID_URL") {
          alert(
            "Invalid Spotify playlist URL. Please make sure you're using a valid Spotify playlist link."
          );
        } else if (error.message.includes("editorial playlist")) {
          alert(error.message);
        } else {
          alert("Failed to import playlist. Please try again later.");
        }
      } else {
        alert("Failed to import playlist. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (e?: React.MouseEvent) => {
    // Only allow closing if not currently loading
    if (!loading) {
      if (progress.stage === "complete") {
        // Only trigger onSuccess when explicitly closing after completion
        onSuccess();
      }
      onClose(e);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import albums from Spotify playlist"
      className="max-w-2xl"
    >
      <div className="space-y-4">
        <p className="text-sm">
          Enter a Spotify playlist URL to import all albums from that playlist.
        </p>
        <Input
          placeholder="Spotify playlist URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
        />

        {(loading || progress.stage === "complete") && (
          <div className="space-y-2">
            {loading && (
              <>
                <div className="flex items-center justify-between text-sm text-white/60">
                  <span>
                    {progress.stage === "fetching"
                      ? "Fetching playlist..."
                      : `Importing ${progress.current} of ${progress.total} albums`}
                  </span>
                  {progress.currentAlbum && (
                    <span>Current: {progress.currentAlbum}</span>
                  )}
                </div>

                {/* Progress bar */}
                {progress.total > 0 && (
                  <div className="w-full bg-white/10 rounded-full h-2.5">
                    <div
                      className="bg-white/60 h-2.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${(progress.current / progress.total) * 100}%`,
                      }}
                    />
                  </div>
                )}
              </>
            )}

            {/* Error list */}
            {progress.errors.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-medium text-white/60">
                  Failed to import {progress.errors.length} albums:
                </h3>
                <div className="text-sm text-red-400 max-h-32 overflow-y-auto space-y-1">
                  {progress.errors.map((error, i) => (
                    <div key={i}>{error}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Skipped list */}
            {progress.skipped.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-medium text-white/60">
                  Skipped {progress.skipped.length} albums:
                </h3>
                <div className="text-sm text-yellow-400 max-h-32 overflow-y-auto space-y-1">
                  {progress.skipped.map((skipped, i) => (
                    <div key={i}>{skipped}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Success Summary */}
            {progress.stage === "complete" && (
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-medium text-white/60">
                  Import Summary:
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="text-green-400">
                    Successfully imported: {progress.created.length} albums
                  </div>
                  {progress.skipped.length > 0 && (
                    <div className="text-yellow-400">
                      Skipped (duplicates): {progress.skipped.length} albums
                    </div>
                  )}
                  {progress.errors.length > 0 && (
                    <div className="text-red-400">
                      Failed to import: {progress.errors.length} albums
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3">
          {progress.stage === "complete" ? (
            <Button variant="secondary" onClick={handleClose}>
              Dismiss
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={loading || !url.trim()}>
                Import
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
