export type SpotifyAlbumType = 'album' | 'single' | 'compilation';

export interface SpotifyAlbum {
  id: string;
  name: string;
  album_type: SpotifyAlbumType;
  total_tracks: number;
  release_date: string;
  images: { url: string }[];
  label?: string;
  artists: {
    id: string;
    name: string;
  }[];
  tracks: {
    items: {
      id: string;
      name: string;
      track_number: number;
      duration_ms: number;
      preview_url: string | null;
    }[];
  };
}