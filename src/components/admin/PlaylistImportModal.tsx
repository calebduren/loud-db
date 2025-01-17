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
import { uploadImageFromUrl } from "../../lib/storage/images";
import { checkSpotifyDuplicate } from "../../lib/validation/releaseValidation";

interface PlaylistImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ImportProgress {
  stage: "fetching" | "importing";
  current: number;
  total: number;
  currentAlbum?: string;
  errors: string[];
  skipped: string[];
}

// Helper function to delay between requests
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to retry failed requests
async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await delay(delayMs);
      return retry(fn, retries - 1, delayMs * 2);
    }
    throw error;
  }
}

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
    }));

    for (let i = 0; i < albums.length; i++) {
      const album = albums[i];

      try {
        setProgress((prev) => ({
          ...prev,
          current: i + 1,
          currentAlbum: album.name,
        }));

        // Check for duplicates before proceeding with import
        const { isDuplicate, existingRelease } = await checkSpotifyDuplicate(
          album.name,
          album.artists.map((a) => ({ name: a.name })),
          album.external_urls.spotify
        );

        if (isDuplicate && existingRelease) {
          setProgress((prev) => ({
            ...prev,
            skipped: [
              ...prev.skipped,
              `${album.name} - Already exists in database`,
            ],
          }));
          continue; // Skip this album
        }

        const releaseData = await retry(() =>
          fetchReleaseFromSpotify(album.id)
        );
        if (!releaseData) {
          throw new Error("Failed to fetch release data");
        }

        if (!user?.id) {
          throw new Error("User must be logged in to import albums");
        }

        let coverUrl = "";
        if (album.images[0]?.url) {
          const imagePath = `${Math.random()}.jpg`;
          coverUrl = await retry(() =>
            uploadImageFromUrl(album.images[0].url, imagePath)
          );
        }

        await createRelease({
          name: releaseData.name,
          release_type: releaseData.releaseType as any,
          cover_url: coverUrl,
          genres: releaseData.genres || [],
          record_label: releaseData.recordLabel || "",
          track_count: releaseData.trackCount,
          spotify_url: releaseData.spotify_url,
          release_date: releaseData.releaseDate,
          created_by: user.id,
          artists: releaseData.artists.map((artist) => ({
            name: artist.name,
          })),
          tracks: releaseData.tracks.map((track) => ({
            name: track.name,
            duration_ms: track.duration_ms,
            track_number: track.track_number,
            preview_url: track.preview_url ?? null,
          })),
        });

        await delay(500); // Add a small delay between imports
      } catch (error) {
        console.error("Error importing album:", error);
        setProgress((prev) => ({
          ...prev,
          errors: [
            ...prev.errors,
            `${album.name} - ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          ],
        }));
      }
    }

    if (progress.errors.length === 0 && progress.skipped.length === 0) {
      onSuccess();
      onClose();
    }
  };

  const handleImport = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setProgress({
        stage: "fetching",
        current: 0,
        total: 0,
        errors: [],
        skipped: [],
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Spotify Playlist">
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          Enter a Spotify playlist URL to import all albums from that playlist.
        </p>
        <Input
          placeholder="Spotify playlist URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
        />

        {loading && (
          <div className="space-y-2">
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
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {progress.errors.length > 0 ? "Close" : "Cancel"}
          </Button>
          <Button onClick={handleImport} disabled={loading || !url.trim()}>
            Import
          </Button>
        </div>
      </div>
    </Modal>
  );
}
