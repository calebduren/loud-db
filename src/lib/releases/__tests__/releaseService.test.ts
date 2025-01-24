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
      upsert: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(() => {
        // By default, return null data and no error
        return Promise.resolve({ data: null, error: null });
      })
    };

    // Create a spy for the from() method
    const fromSpy = vi.fn().mockReturnValue(mockQueryBuilder);
    mockSupabase.from = fromSpy;

    // Remove the rpc mock since we don't use it anymore
    mockSupabase.rpc = undefined;

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
      // Mock successful upsert
      const mockQueryBuilder = mockSupabase.from();
      
      // Debug spy
      const singleSpy = vi.fn()
        .mockResolvedValueOnce({ data: null, error: null }) // Initial check
        .mockResolvedValueOnce({ 
          data: { id: 'new-release-id' }, 
          error: null 
        }); // Upsert response
      
      mockQueryBuilder.single = singleSpy;

      // Mock successful delete and insert operations
      mockQueryBuilder.delete = vi.fn().mockReturnThis();
      mockQueryBuilder.insert = vi.fn().mockReturnThis();
      mockQueryBuilder.eq = vi.fn().mockReturnValue({ error: null });
      
      try {
        const result = await createOrUpdateRelease(mockReleaseData, mockArtists);

        console.log('Single calls:', singleSpy.mock.calls);
        console.log('Single results:', singleSpy.mock.results);
        
        expect(result).toBe('new-release-id');
        expect(mockSupabase.from).toHaveBeenCalledWith('releases');
        expect(mockQueryBuilder.upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            ...mockReleaseData,
            cover_url: 'processed-image-url',
            description_author_id: 'user-123',
            updated_at: '2025-01-18T00:28:28.000Z'
          }),
          expect.objectContaining({
            onConflict: 'id',
            returning: 'minimal'
          })
        );

        // Verify artist relationships were created
        expect(mockSupabase.from).toHaveBeenCalledWith('release_artists');
        expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              release_id: 'new-release-id',
              artist_id: 'mock-artist-id',
              position: 0
            }),
            expect.objectContaining({
              release_id: 'new-release-id',
              artist_id: 'mock-artist-id',
              position: 1
            })
          ])
        );
      } catch (error) {
        console.error('Test error:', error);
        console.log('Single spy state:', {
          calls: singleSpy.mock.calls,
          results: singleSpy.mock.results
        });
        throw error;
      }
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
      // Mock successful upsert and related operations
      const mockQueryBuilder = mockSupabase.from();
      
      // Debug spy
      const singleSpy = vi.fn()
        .mockResolvedValueOnce({ data: { id: existingRelease.id }, error: null }) // Initial check
        .mockResolvedValueOnce({ data: { id: existingRelease.id }, error: null }); // Upsert response
      
      mockQueryBuilder.single = singleSpy;

      // Mock successful delete and insert operations
      const deleteSpy = vi.fn().mockReturnValue({ error: null });
      const insertSpy = vi.fn().mockReturnValue({ error: null });
      
      mockQueryBuilder.delete = vi.fn().mockReturnThis();
      mockQueryBuilder.insert = vi.fn().mockReturnThis();
      mockQueryBuilder.eq = vi.fn().mockReturnValue({ error: null });
      
      try {
        const result = await createOrUpdateRelease(
          mockReleaseData,
          mockArtists,
          existingRelease
        );

        console.log('Single calls:', singleSpy.mock.calls);
        console.log('Single results:', singleSpy.mock.results);
        
        expect(result).toBe(existingRelease.id);
        
        // Verify release upsert
        expect(mockSupabase.from).toHaveBeenCalledWith('releases');
        expect(mockQueryBuilder.upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            id: existingRelease.id,
            ...mockReleaseData,
            cover_url: 'processed-image-url',
            description_author_id: 'user-123',
            updated_at: '2025-01-18T00:28:28.000Z'
          }),
          expect.objectContaining({
            onConflict: 'id',
            returning: 'minimal'
          })
        );

        // Verify existing relationships were deleted
        expect(mockSupabase.from).toHaveBeenCalledWith('release_artists');
        expect(mockQueryBuilder.delete).toHaveBeenCalled();
        expect(mockQueryBuilder.eq).toHaveBeenCalledWith('release_id', existingRelease.id);

        // Verify new relationships were created
        expect(mockSupabase.from).toHaveBeenCalledWith('release_artists');
        expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              release_id: existingRelease.id,
              artist_id: 'mock-artist-id',
              position: 0
            }),
            expect.objectContaining({
              release_id: existingRelease.id,
              artist_id: 'mock-artist-id',
              position: 1
            })
          ])
        );
      } catch (error) {
        console.error('Test error:', error);
        console.log('Single spy state:', {
          calls: singleSpy.mock.calls,
          results: singleSpy.mock.results
        });
        throw error;
      }
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
