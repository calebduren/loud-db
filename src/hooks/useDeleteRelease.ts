import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function useDeleteRelease() {
  const [deleting, setDeleting] = useState(false);

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
      return true;
    } catch (error) {
      console.error('Error deleting release:', error);
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return { deleteRelease, deleting };
}