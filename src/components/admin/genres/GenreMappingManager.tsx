import React from 'react';
import { useGenreMappingManager } from '../../../hooks/admin/useGenreMappingManager';
import { GenreGroupList } from './GenreGroupList';
import { NewGroupForm } from './NewGroupForm';
import { LoadingSpinner } from '../../LoadingSpinner';
import { Tags, AlertCircle } from 'lucide-react';
import { OrphanedGenres } from './OrphanedGenres';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function GenreMappingManager() {
  const {
    groups,
    mappings,
    loading,
    createGroup,
    updateGroup,
    createMapping,
    deleteMapping,
    error
  } = useGenreMappingManager();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Tags className="w-6 h-6" />
          Genre Management
        </h2>
        <p className="text-white/60 mb-6">
          Create and manage genre groups to improve filtering and organization.
        </p>
      </div>

      <Tabs defaultValue="groups" className="space-y-6">
        <TabsList>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Tags className="w-4 h-4" />
            Genre Groups
          </TabsTrigger>
          <TabsTrigger value="orphaned" className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Orphaned Genres
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-8">
          <NewGroupForm onSubmit={createGroup} error={error} />
          
          <div className="border-t border-white/10 pt-8">
            <GenreGroupList
              groups={groups}
              mappings={mappings}
              onUpdateGroup={updateGroup}
              onCreateMapping={createMapping}
              onDeleteMapping={deleteMapping}
            />
          </div>
        </TabsContent>

        <TabsContent value="orphaned">
          <OrphanedGenres
            groups={groups}
            mappings={mappings}
            onAssignGenre={createMapping}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}