export interface ArtistData {
  id?: string;
  name: string;
  image_url?: string;
}

export interface ReleaseFormData {
  name: string;
  release_type: "single" | "EP" | "LP" | "compilation";
  cover_url?: string;
  genres: string[];
  record_label?: string;
  track_count: number;
  spotify_url?: string;
  apple_music_url?: string;
  release_date: string;
  description?: string | null;
  description_author_id?: string | null;
}
