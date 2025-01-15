import React from "react";
import { GenreGroup, GenreMapping } from "../../../lib/genres/genreMapping";
import { MappingForm } from "./MappingForm";
import { X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface GenreGroupListProps {
  groups: GenreGroup[];
  mappings: GenreMapping[];
  onCreateMapping: (genre: string, groupId: string) => Promise<void>;
  onDeleteMapping: (id: string) => Promise<void>;
  onUpdateGroup: (id: string, name: string) => Promise<void>;
}

export function GenreGroupList({
  groups,
  mappings,
  onCreateMapping,
  onDeleteMapping,
  onUpdateGroup,
}: GenreGroupListProps) {
  const [editingGroup, setEditingGroup] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState("");
  const [updating, setUpdating] = React.useState(false);

  const handleEdit = (group: GenreGroup) => {
    setEditingGroup(group.id);
    setEditValue(group.name);
  };

  const handleUpdate = async (id: string) => {
    if (!editValue.trim()) return;

    setUpdating(true);
    try {
      await onUpdateGroup(id, editValue);
      setEditingGroup(null);
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setUpdating(false);
    }
  };

  // Group mappings by genre for better display
  const genreMappings = mappings.reduce((acc, mapping) => {
    if (!acc[mapping.genre]) {
      acc[mapping.genre] = [];
    }
    acc[mapping.genre].push(mapping);
    return acc;
  }, {} as Record<string, GenreMapping[]>);

  return (
    <div className="grid gap-6">
      {groups.map((group) => (
        <div key={group.id} className="card">
          <div className="flex items-center justify-between mb-4">
            {editingGroup === group.id ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-48"
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={() => handleUpdate(group.id)}
                  disabled={updating || !editValue.trim()}
                >
                  <Check size={14} strokeWidth={1.5} />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setEditingGroup(null)}
                >
                  <X size={14} strokeWidth={1.5} />
                </Button>
              </div>
            ) : (
              <div className="flex w-full items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">{group.name}</h3>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleEdit(group)}
                >
                  Edit
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Existing mappings */}
            <div className="flex flex-wrap gap-2">
              {mappings
                .filter((m) => m.group_id === group.id)
                .map((mapping) => (
                  <div
                    key={mapping.id}
                    className="pill pill--interactive group"
                  >
                    <span>{mapping.genre}</span>
                    {/* Show other groups this genre belongs to */}
                    {genreMappings[mapping.genre].length > 1 && (
                      <span className="text-white/40 text-xs">
                        +{genreMappings[mapping.genre].length - 1}
                      </span>
                    )}
                    <button
                      onClick={() => onDeleteMapping(mapping.id)}
                      className="text-white/40 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
            </div>

            {/* Add new mapping form */}
            <MappingForm 
              groupId={group.id} 
              onSubmit={onCreateMapping}
              existingGenres={mappings
                .filter(m => m.group_id === group.id)
                .map(m => m.genre)
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}
