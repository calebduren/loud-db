import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Release, ReleaseType } from "../../types/database";
import { Loader2 } from "lucide-react";
import { ReleaseFormFields } from "./ReleaseFormFields";
import { useArtists } from "../../hooks/useArtists";

interface EditReleaseFormProps {
  release: Release;
  onSuccess?: () => void;
}

export function EditReleaseForm({ release, onSuccess }: EditReleaseFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: release.name,
    release_type: release.release_type as ReleaseType,
    cover_url: release.cover_url || "",
    genres: release.genres,
    record_label: release.record_label || "",
    track_count: release.track_count,
    spotify_url: release.spotify_url || "",
    apple_music_url: release.apple_music_url || "",
  });

  const [selectedArtists, setSelectedArtists] = useState(
    release.artists
      .sort((a, b) => a.position - b.position)
      .map((ra) => ({ id: ra.artist.id, name: ra.artist.name }))
  );

  const { artists } = useArtists();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update release
      const { error: releaseError } = await supabase
        .from("releases")
        .update(formData)
        .eq("id", release.id);

      if (releaseError) throw releaseError;

      // Delete existing artist relationships
      await supabase
        .from("release_artists")
        .delete()
        .eq("release_id", release.id);

      // Create new artist relationships
      const artistIds = [];
      for (const artist of selectedArtists) {
        let artistId = artist.id;

        if (!artistId) {
          // Create new artist
          const { data: newArtist } = await supabase
            .from("artists")
            .insert({ name: artist.name })
            .select()
            .single();

          if (newArtist) artistId = newArtist.id;
        }

        if (artistId) artistIds.push(artistId);
      }

      // Create new relationships
      await supabase.from("release_artists").insert(
        artistIds.map((artistId, index) => ({
          release_id: release.id,
          artist_id: artistId,
          position: index,
        }))
      );

      onSuccess?.();
    } catch (error) {
      console.error("Error updating release:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormDataChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateArtist = (index: number, value: string) => {
    const newArtists = [...selectedArtists];
    const existingArtist = artists.find(
      (a) => a.name.toLowerCase() === value.toLowerCase()
    );

    newArtists[index] = existingArtist
      ? { id: existingArtist.id, name: existingArtist.name }
      : { name: value };

    setSelectedArtists(newArtists);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-6 rounded-lg shadow-md"
    >
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-black">
          Edit Release
        </h2>
      </div>

      <ReleaseFormFields
        formData={formData}
        selectedArtists={selectedArtists}
        artistOptions={artists}
        onFormDataChange={handleFormDataChange}
        onArtistChange={updateArtist}
        onAddArtist={() =>
          setSelectedArtists([...selectedArtists, { name: "" }])
        }
        onRemoveArtist={(index) =>
          setSelectedArtists(selectedArtists.filter((_, i) => i !== index))
        }
      />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-4 h-4" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </form>
  );
}
