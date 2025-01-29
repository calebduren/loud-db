import React, { useCallback, useState, useEffect } from "react";
import { Release } from "../../../types/database";
import { ReleaseFormTabs } from "./ReleaseFormTabs";
import { SpotifyImportSection } from "../SpotifyImportSection";
import { Button } from "../../ui/button";
import { Form } from "../../ui/form";
import { useReleaseForm } from "../../../hooks/useReleaseForm";
import { useArtistSelection } from "./useArtistSelection";
import { useArtists } from "../../../hooks/useArtists";
import { SpotifyReleaseData } from "../../../lib/spotify/types";
import { validateArtists } from "../../../lib/releases/validation";
import { DuplicateReleaseError } from "../../releases/DuplicateReleaseError";
import { useAuth } from "../../../contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ReleaseTrack {
  name: string;
  duration_ms: number | undefined;
  track_number: number;
  credits: Array<{
    name: string;
    role: string;
    id?: string;
  }>;
  id?: string;
  preview_url?: string;
  release_id?: string;
  created_at?: string;
}

interface ReleaseFormData {
  name: string;
  release_type: "single" | "EP" | "LP" | "compilation";
  cover_url: string;
  genres: string[];
  record_label: string;
  track_count: number;
  spotify_url: string;
  apple_music_url: string;
  release_date: string;
  description: string;
  tracks: ReleaseTrack[];
}

interface ReleaseFormProps {
  release?: Release;
  onSuccess?: (release: Release) => void;
  onClose?: () => void;
}

interface DuplicateError {
  code: string;
  message: string;
}

export function ReleaseForm({ release, onSuccess, onClose }: ReleaseFormProps) {
  const {
    form,
    loading,
    error,
    handleSubmit: originalHandleSubmit,
    reset,
  } = useReleaseForm(release);
  const { artists } = useArtists();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format artists data to match artistOptions type
  const formattedArtistOptions =
    artists?.map((artist) => ({
      id: artist.id,
      name: artist.name,
    })) || [];

  const {
    selectedArtists,
    setSelectedArtists,
    handleArtistChange,
    addArtist,
    removeArtist,
  } = useArtistSelection(
    release?.artists.map((ra) => ({
      id: ra.artist.id,
      name: ra.artist.name,
      image_url: ra.artist.image_url,
    })) || [{ name: "" }]
  );

  const handleClose = useCallback(() => {
    // Clear form data
    localStorage.removeItem("releaseFormDraft");
    reset();
    setSelectedArtists([{ name: "" }]);
    onClose?.();
  }, [onClose, reset, setSelectedArtists]);

  // Initialize form with release data if editing
  React.useEffect(() => {
    if (release) {
      const formData: ReleaseFormData = {
        name: release.name,
        release_type: release.release_type,
        cover_url: release.cover_url || "",
        genres: release.genres,
        record_label: release.record_label || "",
        track_count: release.track_count,
        spotify_url: release.spotify_url || "",
        apple_music_url: release.apple_music_url || "",
        release_date: new Date(release.release_date)
          .toISOString()
          .split("T")[0],
        description: release.description || "",
        tracks: (release.tracks || []).map((track) => ({
          name: track.name,
          duration_ms: track.duration_ms || 0,
          track_number: track.track_number,
          credits:
            track.track_credits?.map((credit) => ({
              name: credit.name,
              role: credit.role,
              id: credit.id,
            })) || [],
          id: track.id,
          preview_url: track.preview_url || undefined,
        })),
      };

      form.reset(formData);

      setSelectedArtists(
        release.artists.map((ra) => ({
          id: ra.artist.id,
          name: ra.artist.name,
          image_url: ra.artist.image_url,
        }))
      );
    }
  }, [release, form]);

  const handleSpotifyImport = useCallback(
    (importedData: SpotifyReleaseData) => {
      const formData: ReleaseFormData = {
        name: importedData.name,
        release_type: importedData.releaseType,
        cover_url: importedData.coverUrl || "",
        genres: importedData.genres,
        record_label: importedData.recordLabel || "",
        track_count: importedData.trackCount,
        spotify_url: importedData.spotify_url || "",
        release_date: new Date(
          new Date(importedData.releaseDate).getTime() +
            new Date().getTimezoneOffset() * 60000
        )
          .toISOString()
          .split("T")[0],
        description: "",
        tracks: importedData.tracks.map((track) => ({
          ...track,
          duration_ms: track.duration_ms ?? undefined,
          preview_url: track.preview_url || undefined,
          credits: [],
        })),
        apple_music_url: "",
      };

      form.reset(formData);
      setSelectedArtists(
        importedData.artists.map((artist) => ({
          id: undefined,
          name: artist.name,
        }))
      );
    },
    [form, setSelectedArtists]
  );

  const handleFormSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);

      const values = form.getValues();
      const formIsValid = await form.trigger();

      if (!formIsValid) {
        return;
      }

      const artistError = validateArtists(selectedArtists);
      if (artistError) {
        form.setError("name", { message: artistError });
        return;
      }

      const releaseId = await originalHandleSubmit(values, selectedArtists);
      if (releaseId) {
        try {
          // Close modal first
          handleClose();

          // Create a basic release object for immediate UI update
          const basicRelease: Release = {
            id: releaseId,
            ...values,
            description: values.description || null,
            created_by: user?.id || "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            description_author_id: user?.id || null,
            artists: selectedArtists.map((a, index) => ({
              position: index,
              artist: {
                id: a.id || "",
                name: a.name,
              },
            })),
            tracks: values.tracks.map((track) => ({
              ...track,
              id: track.id || crypto.randomUUID(),
              release_id: releaseId,
              created_at: new Date().toISOString(),
              preview_url: track.preview_url || null,
            })),
          };

          // Update UI immediately with basic data
          onSuccess?.(basicRelease);

          // Show success toast
          toast.success(
            release
              ? "Release updated successfully"
              : "Release created successfully"
          );

          // Let the database become consistent before triggering any refreshes
          await new Promise((resolve) => setTimeout(resolve, 1500));

          // Trigger a background refresh of the releases list
          window.dispatchEvent(new CustomEvent("refreshReleases"));
        } catch (error) {
          console.error("Error in release form submission:", error);
          toast.error("There was an error saving the release");
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to save release. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <div className="space-y-6">
        {error?.code === "DUPLICATE_RELEASE" ? (
          <DuplicateReleaseError error={error as DuplicateError} />
        ) : (
          Object.keys(form.formState.errors).length > 0 && (
            <div className="text-red-500 text-sm space-y-1">
              {Object.entries(form.formState.errors).map(([key, error]) => (
                <p key={key}>
                  {error?.message?.toString() || `Invalid ${key}`}
                </p>
              ))}
            </div>
          )
        )}

        <SpotifyImportSection
          onImport={handleSpotifyImport}
          disabled={loading || isSubmitting}
        />

        <ReleaseFormTabs
          form={form}
          selectedArtists={selectedArtists}
          artistOptions={formattedArtistOptions}
          onArtistChange={handleArtistChange}
          onAddArtist={addArtist}
          onRemoveArtist={removeArtist}
        />

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleFormSubmit}
            disabled={loading || isSubmitting}
            className="flex items-center gap-2"
          >
            {loading || isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {release ? "Saving..." : "Creating..."}
              </>
            ) : (
              <>{release ? "Save Changes" : "Create Release"}</>
            )}
          </Button>
        </div>
      </div>
    </Form>
  );
}
