import { useState, useEffect } from 'react';
import { 
  getGenreGroups, 
  getGenreMappings,
  createGenreGroup,
  updateGenreGroup,
  createGenreMapping,
  deleteGenreMapping,
  GenreGroup,
  GenreMapping
} from '../../lib/genres/genreMapping';
import { useToast } from '../useToast';

export function useGenreMappingManager() {
  const [groups, setGroups] = useState<GenreGroup[]>([]);
  const [mappings, setMappings] = useState<GenreMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [groupsData, mappingsData] = await Promise.all([
        getGenreGroups(),
        getGenreMappings()
      ]);
      setGroups(groupsData);
      setMappings(mappingsData);
    } catch (err) {
      console.error('Error fetching genre data:', err);
      showToast({
        type: 'error',
        message: 'Failed to load genre data'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (name: string) => {
    setError(null);
    try {
      const group = await createGenreGroup(name);
      setGroups(prev => [...prev, group]);
      showToast({
        type: 'success',
        message: 'Genre group created successfully'
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create group';
      setError(message);
      showToast({
        type: 'error',
        message
      });
      throw err; // Re-throw to handle in the form
    }
  };

  const handleCreateMapping = async (genre: string, groupId: string) => {
    try {
      const mapping = await createGenreMapping(genre, groupId);
      setMappings(prev => [...prev, mapping]);
      showToast({
        type: 'success',
        message: 'Genre mapping created successfully'
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create genre mapping';
      showToast({
        type: 'error',
        message
      });
      throw err;
    }
  };

  const handleDeleteMapping = async (id: string) => {
    try {
      await deleteGenreMapping(id);
      setMappings(prev => prev.filter(m => m.id !== id));
      showToast({
        type: 'success',
        message: 'Genre mapping deleted successfully'
      });
    } catch (err) {
      showToast({
        type: 'error',
        message: 'Failed to delete genre mapping'
      });
      throw err;
    }
  };

  const handleUpdateGroup = async (id: string, name: string) => {
    setError(null);
    try {
      const updatedGroup = await updateGenreGroup(id, name);
      setGroups(prev => prev.map(g => 
        g.id === id ? updatedGroup : g
      ));
      showToast({
        type: 'success',
        message: 'Genre group updated successfully'
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update group';
      setError(message);
      showToast({
        type: 'error',
        message
      });
      throw err;
    }
  };

  return {
    groups,
    mappings,
    loading,
    error,
    createGroup: handleCreateGroup,
    updateGroup: handleUpdateGroup,
    createMapping: handleCreateMapping,
    deleteMapping: handleDeleteMapping
  };
}