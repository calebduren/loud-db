import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabase";

export function useAllGenres() {
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGenres() {
      try {
        // Fetch from the new genres table
        const { data, error } = await supabase
          .from('genres')
          .select('name')
          .order('name');
        
        if (error) throw error;

        if (data) {
          // Map the genre names from the result
          const genreNames = data.map(genre => genre.name);
          setGenres(genreNames);
        }
      } catch (err) {
        console.error('Error fetching genres:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch genres');
      } finally {
        setLoading(false);
      }
    }
    
    fetchGenres();
  }, []);
  
  return { genres, loading, error };
}
