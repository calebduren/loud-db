import { supabase } from "../supabase";
import { ScrapedRelease } from "./types";
import { uploadImageFromUrl } from "../storage/images";
import { normalizeGenre } from "../utils/genreUtils";

export async function importRelease(release: ScrapedRelease, userId: string) {
  try {
    // Download and upload cover image if available
    let coverUrl = release.coverUrl;
    if (coverUrl) {
      const uploadedUrl = await uploadImageFromUrl(
        coverUrl,
        `${Math.random()}.jpg`
      );
      if (uploadedUrl) {
        coverUrl = uploadedUrl;
      }
    }

    // 1. Create or get artists
    const artistIds = await Promise.all(
      release.artists.map(async (artist) => {
        const { data: existingArtist } = await supabase
          .from("artists")
          .select("id")
          .ilike("name", artist.name)
          .maybeSingle();

        if (existingArtist) {
          return existingArtist.id;
        }

        const { data: newArtist } = await supabase
          .from("artists")
          .insert({ name: artist.name })
          .select("id")
          .single();

        return newArtist?.id;
      })
    );

    // 2. Create release
    const { data: newRelease, error: releaseError } = await supabase
      .from("releases")
      .insert({
        name: release.name,
        release_type: release.releaseType,
        cover_url: coverUrl,
        genres: release.genres.map(normalizeGenre), // Normalize genres
        record_label: release.recordLabel,
        track_count: release.trackCount,
        created_by: userId,
        release_date: release.releaseDate,
      })
      .select("id")
      .single();

    if (releaseError) throw releaseError;

    // 3. Create artist relationships
    if (newRelease) {
      await Promise.all(
        artistIds.map((artistId: string | undefined, index: number) => {
          if (!artistId) return Promise.resolve();

          return supabase.from("release_artists").insert({
            release_id: newRelease.id,
            artist_id: artistId,
            position: index,
          });
        })
      );
    }

    return true;
  } catch (error) {
    console.error("Error importing release:", error);
    return false;
  }
}
