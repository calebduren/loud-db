import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockSupabase } from '../../mocks/supabase';
import { createOrUpdateRelease } from '../releaseService';
import { processReleaseImage } from '../../storage/imageUtils';
import { findOrCreateArtist } from '../../artists/artistService';
import { 
  ArtistValidationError, 
  DatabaseError, 
  TrackValidationError 
} from '../../errors/releaseServiceErrors';
import type { Release } from '../../../types/database';

// Mock dependencies
vi.mock('../../storage/imageUtils', () => ({
  processReleaseImage: vi.fn()
}));

vi.mock('../../artists/artistService', () => ({
  findOrCreateArtist: vi.fn()
}));

vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

describe('createOrUpdateRelease', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mock implementations
    vi.mocked(processReleaseImage).mockResolvedValue('processed-image-url');
    vi.mocked(findOrCreateArtist).mockResolvedValue('mock-artist-id');
    
    // Setup Supabase mock with proper response structure
    const mockQueryBuilder = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null })
    };
    mockSupabase.from.mockImplementation(() => mockQueryBuilder);
    mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

    // Mock Date.now() to return a consistent timestamp
    vi.setSystemTime(new Date('2025-01-17T16:28:28-08:00'));
  });

  const mockReleaseData = {
    name: 'Test Release',
    release_type: 'album' as const,
    cover_url: 'http://example.com/cover.jpg',
    genres: ['rock'],
    record_label: 'Test Label',
    track_count: 2,
    spotify_url: 'http://spotify.com/album',
    apple_music_url: 'http://apple.com/album',
    release_date: '2025-01-17',
    description: 'Test description',
    created_by: 'user-123'
  };

  const mockArtists = [
    { name: 'Artist 1' },
    { name: 'Artist 2' }
  ];

  describe('Creating a new release', () => {
    it('should successfully create a new release', async () => {
      // Mock initial check
      const mockQueryBuilder = mockSupabase.from();
      mockQueryBuilder.single
        .mockResolvedValueOnce({ data: null, error: null }) // Initial check
        .mockResolvedValueOnce({ data: { id: 'new-release-id' }, error: null }); // Fetch new ID

      // Mock successful transaction
      mockSupabase.rpc.mockResolvedValueOnce({ data: null, error: null });

      const result = await createOrUpdateRelease(mockReleaseData, mockArtists);

      expect(result).toBe('new-release-id');
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'update_release_transaction',
        {
          p_release_id: undefined,
          p_release_data: {
            ...mockReleaseData,
            cover_url: 'processed-image-url',
            description_author_id: 'user-123',
            updated_at: '2025-01-18T00:28:28.000Z'
          },
          p_artist_ids: ['mock-artist-id', 'mock-artist-id'],
          p_tracks: [],
          p_track_credits: []
        }
      );
    });

    it('should throw ArtistValidationError if no valid artists provided', async () => {
      // Mock initial check to pass
      const mockQueryBuilder = mockSupabase.from();
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: null,
        error: null
      });

      await expect(
        createOrUpdateRelease(mockReleaseData, [])
      ).rejects.toThrow(ArtistValidationError);
    });

    it('should handle image processing', async () => {
      // Mock initial check and ID fetch
      const mockQueryBuilder = mockSupabase.from();
      mockQueryBuilder.single
        .mockResolvedValueOnce({ data: null, error: null }) // Initial check
        .mockResolvedValueOnce({ data: { id: 'new-release-id' }, error: null }); // Fetch new ID

      mockSupabase.rpc.mockResolvedValueOnce({ data: null, error: null });

      await createOrUpdateRelease(mockReleaseData, mockArtists);

      expect(processReleaseImage).toHaveBeenCalledWith(mockReleaseData.cover_url);
    });
  });

  describe('Updating an existing release', () => {
    const existingRelease = {
      id: 'existing-id',
      ...mockReleaseData
    } as Release;

    it('should successfully update an existing release', async () => {
      // Mock release existence check
      const mockQueryBuilder = mockSupabase.from();
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: { id: existingRelease.id },
        error: null
      });

      // Mock successful transaction
      mockSupabase.rpc.mockResolvedValueOnce({ data: null, error: null });

      const result = await createOrUpdateRelease(
        mockReleaseData,
        mockArtists,
        existingRelease
      );

      expect(result).toBe(existingRelease.id);
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'update_release_transaction',
        {
          p_release_id: existingRelease.id,
          p_release_data: {
            ...mockReleaseData,
            cover_url: 'processed-image-url',
            description_author_id: 'user-123',
            updated_at: '2025-01-18T00:28:28.000Z'
          },
          p_artist_ids: ['mock-artist-id', 'mock-artist-id'],
          p_tracks: [],
          p_track_credits: []
        }
      );
    });

    it('should throw if release no longer exists', async () => {
      const mockQueryBuilder = mockSupabase.from();
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: null,
        error: null
      });

      await expect(
        createOrUpdateRelease(mockReleaseData, mockArtists, existingRelease)
      ).rejects.toThrow(DatabaseError);
    });
  });

  describe('Error handling', () => {
    it('should handle transaction errors', async () => {
      const mockQueryBuilder = mockSupabase.from();
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: null,
        error: null
      });

      mockSupabase.rpc.mockResolvedValueOnce({
        data: null,
        error: new Error('Transaction failed')
      });

      await expect(
        createOrUpdateRelease(mockReleaseData, mockArtists)
      ).rejects.toThrow(DatabaseError);
    });

    it('should validate tracks if provided', async () => {
      const mockQueryBuilder = mockSupabase.from();
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: null,
        error: null
      });

      const dataWithInvalidTracks = {
        ...mockReleaseData,
        tracks: [
          { name: '', track_number: 0 } // Invalid track
        ]
      };

      await expect(
        createOrUpdateRelease(dataWithInvalidTracks, mockArtists)
      ).rejects.toThrow(TrackValidationError);
    });
  });
});
