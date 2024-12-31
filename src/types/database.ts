// Add to existing types
export interface GenrePreference {
  id: string;
  user_id: string;
  genre_group_id: string;
  weight: number;
  created_at: string;
}

export interface Release {
  id: string;
  name: string;
  release_type: ReleaseType;
  cover_url?: string;
  genres: string[];
  record_label?: string;
  track_count: number;
  spotify_url?: string;
  apple_music_url?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  release_date: string;
  description: string | null;
  description_author_id: string | null;
  description?: string | null;
  description_author?: {
    id: string;
    username: string;
  } | null;
  artists: Array<{
    position: number;
    artist: {
      id: string;
      name: string;
    };
  }>;
  tracks: Array<{
    id: string;
    name: string;
    duration_ms: number | null;
    track_number: number;
    preview_url: string | null;
    track_credits?: Array<{
      id: string;
      name: string;
      role: string;
    }>;
  }>;
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
