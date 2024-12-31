import { ReleaseType } from '../../types/database';
import { SpotifyAlbumType } from './types/album';

export function detectReleaseType(spotifyType: SpotifyAlbumType, trackCount: number): ReleaseType {
  // First check explicit types
  switch (spotifyType) {
    case 'compilation':
      return 'compilation';
    case 'single':
      // Singles with 3-5 tracks are typically EPs
      return trackCount >= 3 && trackCount <= 5 ? 'EP' : 'single';
    case 'album':
      // Short albums (1-2 tracks) are singles
      if (trackCount <= 2) return 'single';
      // Albums with 3-5 tracks are typically EPs
      if (trackCount <= 5) return 'EP';
      // Longer releases are full albums
      return 'LP';
    default:
      // Fallback logic based on track count
      if (trackCount <= 2) return 'single';
      if (trackCount <= 5) return 'EP';
      return 'LP';
  }
}