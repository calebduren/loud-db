// Add to existing types
export interface GenrePreference {
  id: string;
  user_id: string;
  genre_group_id: string;
  weight: number;
  created_at: string;
}

export type ReleaseType = "LP" | "EP" | "Single" | "Compilation";

export interface Release {
  id: string;
  name: string;
  release_type: ReleaseType;
  cover_url: string | null;
  genres: string[] | null;
  genre_ids: string[] | null;
  genre_names: string[] | null;
  record_label: string | null;
  created_at: string;
  release_date: string | null;
  artists: Array<{
    position: number;
    artist_name: string;
  }> | null;
  // Optional fields that may be loaded later
  release_genres?: Array<{
    genre: {
      id: string;
      name: string;
    };
  }> | null;
  track_count?: number;
  spotify_url?: string | null;
  apple_music_url?: string | null;
  updated_at?: string;
  created_by?: string;
  description?: string | null;
  description_author_id?: string | null;
  description_author?: {
    id: string;
    username: string;
  } | null;
  tracks?: Array<{
    id: string;
    name: string;
    track_number: number;
    duration_ms: number | null;
    preview_url: string | null;
    created_at: string;
  }> | null;
}

export interface Track {
  id: string;
  release_id: string;
  name: string;
  duration_ms: number | null;
  track_number: number;
  preview_url: string | null;
  created_at: string;
  track_credits?: TrackCredit[];
}

export interface TrackCredit {
  id: string;
  track_id: string;
  name: string;
  role: string;
  created_at: string;
}

export type UserRole = 'admin' | 'creator' | 'user';

export interface Profile {
  id: string;
  username: string;
  role: UserRole;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  suspended?: boolean;
}
