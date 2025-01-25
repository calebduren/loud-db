// Add to existing types
export interface GenrePreference {
  id: string;
  user_id: string;
  genre_group_id: string;
  weight: number;
  created_at: string;
}

export type ReleaseType = 'single' | 'EP' | 'LP' | 'compilation';

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
  description_author?: {
    id: string;
    username: string;
  } | null;
  artists: {
    artist: {
      id: string;
      name: string;
      image_url?: string | null;
    };
  }[];
  isRecommended?: boolean;
  _score?: number;
  _scoreDetails?: string[];
  tracks?: Track[];
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
