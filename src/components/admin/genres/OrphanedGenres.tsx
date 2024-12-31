import React from 'react';
import { useReleases } from '../../../hooks/useReleases';
import { Button } from '../../ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { GenreGroup, GenreMapping } from '../../../lib/genres/genreMapping';
import { MultiSelect } from '../../ui/MultiSelect';

interface OrphanedGenresProps {
  groups: GenreGroup[];
  mappings: GenreMapping[];
  onAssignGenre: (genre: string, groupId: string) => Promise<void>;
}

export function OrphanedGenres({ groups, mappings, onAssignGenre }: OrphanedGenresProps) {
  const { releases, loading } = useReleases();
  const [selectedGroups, setSelectedGroups] = React.useState<Record<string, string[]>>({});
  const [assigning, setAssigning] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Get all unique genres from releases
  const allGenres = React.useMemo(() => {
    const genres = new Set<string>();
    releases.forEach(release => {
      release.genres.forEach(genre => genres.add(genre));
    });
    return Array.from(genres).sort();
  }, [releases]);

  // Filter out genres that are already mapped
  const orphanedGenres = React.useMemo(() => {
    return allGenres.filter(genre => 
      !mappings.some(mapping => mapping.genre === genre)
    );
  }, [allGenres, mappings]);

  const handleAssign = async (genre: string) => {
    const groupIds = selectedGroups[genre];
    if (!groupIds?.length) return;
    
    setError(null);
    setAssigning(genre);
    
    try {
      // Assign genre to each selected group
      await Promise.all(
        groupIds.map(groupId => onAssignGenre(genre, groupId))
      );
      
      // Clear selection after successful assignment
      setSelectedGroups(prev => {
        const next = { ...prev };
        delete next[genre];
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign genre');
    } finally {
      setAssigning(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-white/40" />
      </div>
    );
  }

  if (orphanedGenres.length === 0) {
    return (
      <div className="bg-green-500/10 text-green-500 p-4 rounded-lg flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        All genres have been assigned to groups!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Orphaned Genres</h3>
        <span className="text-sm text-white/60">
          {orphanedGenres.length} unassigned {orphanedGenres.length === 1 ? 'genre' : 'genres'}
        </span>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-500 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
      
      <div className="grid gap-4">
        {orphanedGenres.map(genre => (
          <div 
            key={genre}
            className="flex items-center gap-4 bg-white/5 p-4 rounded-lg"
          >
            <span className="flex-1">{genre}</span>
            
            <div className="flex items-center gap-2">
              <MultiSelect
                value={selectedGroups[genre] || []}
                onChange={values => setSelectedGroups(prev => ({
                  ...prev,
                  [genre]: values
                }))}
                options={groups.map(group => ({
                  value: group.id,
                  label: group.name
                }))}
                placeholder="Select groups..."
                className="w-64"
              />

              <Button
                onClick={() => handleAssign(genre)}
                disabled={!selectedGroups[genre]?.length || assigning === genre}
                size="sm"
              >
                {assigning === genre ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : 'Assign'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}