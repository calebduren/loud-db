import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from './useToast';

export function useDeleteRelease() {
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const deleteRelease = async (id: string) => {
    if (!confirm('Are you sure you want to delete this release? This action cannot be undone.')) {
      return false;
    }

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('releases')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      showToast({
        type: 'success',
        message: 'Release deleted successfully'
      });
      return true;
    } catch (error) {
      console.error('Error deleting release:', error);
      showToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete release'
      });
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return { deleteRelease, deleting };
}