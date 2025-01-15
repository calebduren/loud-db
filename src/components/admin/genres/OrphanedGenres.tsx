import React from "react";
import { useAllGenres } from "../../../hooks/admin/useAllGenres";
import { Button } from "../../ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import { GenreGroup, GenreMapping } from "../../../lib/genres/genreMapping";
import { MultiSelect } from "../../ui/MultiSelect";

interface OrphanedGenresProps {
  groups: GenreGroup[];
  mappings: GenreMapping[];
  onAssignGenre: (genre: string, groupId: string) => Promise<void>;
}

export function OrphanedGenres({
  groups,
  mappings,
  onAssignGenre,
}: OrphanedGenresProps) {
  const { genres: allGenres, loading, error: fetchError } = useAllGenres();
  const [selectedGroups, setSelectedGroups] = React.useState<
    Record<string, string[]>
  >({});
  const [assigning, setAssigning] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Filter out genres that are already mapped
  const orphanedGenres = React.useMemo(() => {
    return allGenres.filter(
      (genre) => !mappings.some((mapping) => mapping.genre === genre)
    );
  }, [allGenres, mappings]);

  const handleAssign = async (genre: string) => {
    const groupsToAssign = selectedGroups[genre];
    if (!groupsToAssign?.length) return;

    setAssigning(genre);
    setError(null);

    try {
      await Promise.all(
        groupsToAssign.map((groupId) => onAssignGenre(genre, groupId))
      );
    } catch (err) {
      console.error("Error assigning genre:", err);
      setError(err instanceof Error ? err.message : "Failed to assign genre");
    } finally {
      setAssigning(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex items-center justify-center py-12 text-red-500">
        <AlertCircle className="w-5 h-5 mr-2" />
        <p>{fetchError}</p>
      </div>
    );
  }

  if (orphanedGenres.length === 0) {
    return (
      <div className="text-center py-12 text-white/60">
        <p>No orphaned genres found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orphanedGenres.map((genre) => (
        <div key={genre} className="flex items-center gap-4">
          <div className="pill pill--default">{genre}</div>
          <div className="flex-1">
            <MultiSelect
              options={groups.map((g) => ({ value: g.id, label: g.name }))}
              value={selectedGroups[genre] || []}
              className="w-full"
              onChange={(selected) =>
                setSelectedGroups((prev) => ({
                  ...prev,
                  [genre]: selected,
                }))
              }
              placeholder="Select groups to add this genre to..."
            />
          </div>
          <Button
            size="sm"
            onClick={() => handleAssign(genre)}
            disabled={!selectedGroups[genre]?.length || assigning === genre}
          >
            {assigning === genre ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Assign"
            )}
          </Button>
        </div>
      ))}
      {error && (
        <div className="flex items-center gap-2 text-red-500 bg-red-500/10 px-4 py-2 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
