import { useEffect, useState } from 'react';
import { spotifyApi } from '../lib/spotify/api';
import { SpotifyArtistDetails } from '../lib/spotify/types';
import { normalizeGenre } from '../lib/utils/genreUtils';
import { refreshTokenIfNeeded } from '../lib/spotify/auth';
import { getCached, setCache } from '../lib/spotify/cache';
import { checkRateLimit } from '../lib/spotify/rateLimiter';

export function useRelatedArtists(artistNames: string[]) {
  const [loading, setLoading] = useState(false);
  const [relatedArtists, setRelatedArtists] = useState<SpotifyArtistDetails[]>([]);

  useEffect(() => {
    async function fetchRelatedArtists() {
      if (!artistNames.length || !artistNames[0].trim()) {
        setRelatedArtists([]);
        return;
      }
      
      const primaryArtist = artistNames[0].trim();
      const cacheKey = `related_artists:${primaryArtist.toLowerCase()}`;
      const cached = getCached<SpotifyArtistDetails[]>(cacheKey);
      
      if (cached) {
        setRelatedArtists(cached);
        return;
      }
      
      setLoading(true);
      try {
        await refreshTokenIfNeeded();
        await checkRateLimit('search');

        // Search with better query
        const searchQuery = primaryArtist
          .replace(/[^\w\s]/g, '') // Remove special characters
          .trim();

        const searchResult = await spotifyApi.searchArtists(searchQuery, { 
          limit: 3 // Get top 3 matches
        });

        // Find best match by name similarity
        const bestMatch = searchResult.artists?.items.find(artist => 
          artist.name.toLowerCase() === primaryArtist.toLowerCase()
        ) || searchResult.artists?.items[0];

        if (bestMatch?.id) {
          await checkRateLimit('related');
          
          try {
            const related = await spotifyApi.getArtistRelatedArtists(bestMatch.id);
            
            if (related?.artists) {
              const formattedArtists = related.artists
                .slice(0, 5)
                .map(artist => ({
                  name: artist.name,
                  genres: artist.genres.map(normalizeGenre),
                  popularity: artist.popularity
                }));
                
              setCache(cacheKey, formattedArtists);
              setRelatedArtists(formattedArtists);
            }
          } catch (error) {
            // If related artists fails, just return empty array
            console.warn('Could not fetch related artists:', error);
            setRelatedArtists([]);
          }
        } else {
          // No matching artist found
          setRelatedArtists([]);
        }
      } catch (error) {
        console.error('Error in artist search:', error);
        setRelatedArtists([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRelatedArtists();
  }, [artistNames]);

  return { relatedArtists, loading };
}