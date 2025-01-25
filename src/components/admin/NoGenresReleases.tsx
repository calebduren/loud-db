import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Release } from '../../types/database';
import { useToast } from '../../hooks/useToast';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';

interface NoGenresRelease extends Release {
  selected?: boolean;
}

export function NoGenresReleases() {
  const [releases, setReleases] = useState<NoGenresRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { showToast } = useToast();
  const [selectAll, setSelectAll] = useState(false);

  const fetchReleasesWithoutGenres = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('releases_view')
        .select(`
          id,
          name,
          release_type,
          cover_url,
          genres,
          record_label,
          created_at,
          release_date,
          artists
        `)
        .or('genres.is.null,genres.eq.{}')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched releases:', data);
      setReleases(data || []);
    } catch (error) {
      console.error('Error fetching releases:', error);
      showToast({
        title: 'Error',
        message: 'Failed to fetch releases without genres',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setReleases(releases.map(release => ({
      ...release,
      selected: !selectAll
    })));
  };

  const handleSelectRelease = (releaseId: string) => {
    setReleases(releases.map(release => 
      release.id === releaseId 
        ? { ...release, selected: !release.selected }
        : release
    ));
  };

  const fetchSpotifyGenres = async (artistName: string) => {
    try {
      console.log(' [Spotify] Fetching genres for artist:', artistName);
      const response = await fetch('/.netlify/functions/spotify-search-artist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: artistName })
      });

      const responseText = await response.text();
      console.log(' [Spotify] Raw response:', responseText);

      if (!response.ok) {
        console.error(' [Spotify] Search failed:', {
          status: response.status,
          statusText: response.statusText,
          response: responseText
        });
        throw new Error(`Failed to fetch artist genres: ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error(' [Spotify] Failed to parse response:', e);
        throw new Error('Invalid response from Spotify search');
      }

      console.log(' [Spotify] Parsed response:', data);
      return data.genres || [];
    } catch (error) {
      console.error(' [Spotify] Error fetching genres:', error);
      return [];
    }
  };

  const updateReleaseGenres = async (releaseId: string, genres: string[]) => {
    try {
      console.log(' [DB] Updating release genres:', { releaseId, genres });
      const { data, error } = await supabase
        .from('releases')
        .update({ genres })
        .eq('id', releaseId)
        .select()
        .single();

      if (error) {
        console.error(' [DB] Supabase update error:', error);
        throw error;
      }
      console.log(' [DB] Updated release:', data);
      return true;
    } catch (error) {
      console.error(' [DB] Error updating release genres:', error);
      return false;
    }
  };

  const findAndUpdateGenres = async () => {
    setProcessing(true);
    console.log(' [Process] Starting genre update process');
    
    const selectedReleases = releases.filter(r => r.selected);
    console.log(' [Process] Selected releases:', selectedReleases);
    
    let successCount = 0;
    let errorCount = 0;

    for (const release of selectedReleases) {
      try {
        console.log(' [Process] Processing release:', { 
          id: release.id, 
          name: release.name,
          artists: release.artists 
        });

        // Get the primary artist's name
        const primaryArtist = Array.isArray(release.artists) && release.artists[0]?.artist?.name;
        if (!primaryArtist) {
          console.error(' [Process] No primary artist found for release:', {
            id: release.id,
            name: release.name,
            artistsData: release.artists
          });
          errorCount++;
          continue;
        }

        console.log(' [Process] Found primary artist:', primaryArtist);

        // Fetch genres from Spotify
        const genres = await fetchSpotifyGenres(primaryArtist);
        console.log(' [Process] Found genres:', genres);
        
        if (genres.length > 0) {
          // Update the release with the found genres
          const success = await updateReleaseGenres(release.id, genres);
          if (success) {
            console.log(' [Process] Successfully updated release:', release.id);
            successCount++;
          } else {
            console.error(' [Process] Failed to update release:', release.id);
            errorCount++;
          }
        } else {
          console.warn(' [Process] No genres found for artist:', primaryArtist);
          errorCount++;
        }
      } catch (error) {
        console.error(' [Process] Error processing release:', error);
        errorCount++;
      }
    }

    console.log(' [Process] Genre update complete:', {
      total: selectedReleases.length,
      success: successCount,
      error: errorCount
    });

    showToast({
      title: 'Genre Update Complete',
      message: `Successfully updated ${successCount} releases. ${errorCount} failed.`,
      type: successCount > 0 ? 'success' : 'error'
    });

    // Refresh the list
    await fetchReleasesWithoutGenres();
    setProcessing(false);
  };

  // Fetch releases on component mount
  useEffect(() => {
    fetchReleasesWithoutGenres();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Releases Without Genres</h1>
        <div className="space-x-2">
          <Button 
            onClick={findAndUpdateGenres} 
            disabled={processing || !releases.some(r => r.selected)}
          >
            {processing ? 'Processing...' : 'Find & Update Genres'}
          </Button>
          <Button onClick={fetchReleasesWithoutGenres} variant="secondary">
            Refresh
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox 
                checked={selectAll} 
                onChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Artists</TableHead>
            <TableHead>Release Date</TableHead>
            <TableHead>Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {releases.map(release => (
            <TableRow key={release.id}>
              <TableCell>
                <Checkbox 
                  checked={release.selected} 
                  onChange={() => handleSelectRelease(release.id)}
                />
              </TableCell>
              <TableCell>{release.name}</TableCell>
              <TableCell>
                {release.artists
                  ?.map(a => a.artist?.name)
                  .filter(Boolean)
                  .join(', ')}
              </TableCell>
              <TableCell>
                {new Date(release.release_date).toLocaleDateString()}
              </TableCell>
              <TableCell>{release.release_type}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
