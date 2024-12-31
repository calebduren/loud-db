export interface SpotifyArtistDetails {
  name: string;
  genres: string[];
  popularity?: number;
  topTracks?: {
    name: string;
    preview_url: string | null;
  }[];
  relatedArtists?: SpotifyArtistDetails[];
}

export interface SpotifyReleaseData {
  name: string;
  artists: SpotifyArtistDetails[];
  releaseType: 'single' | 'EP' | 'LP' | 'compilation';
  coverUrl?: string | null;
  genres: string[];
  recordLabel?: string;
  trackCount: number;
  releaseDate: string;
  spotify_url?: string;
  relatedArtists?: SpotifyArtistDetails[];
  tracks: SpotifyTrack[];
}

export interface SpotifyTrack {
  name: string;
  duration_ms: number;
  track_number: number;
  preview_url?: string | null;
}