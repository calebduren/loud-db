import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabase";

export function useAllGenres() {
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGenres() {
      try {
        const { data, error } = await supabase
          .from('releases')
          .select('genres');
        
        if (error) throw error;

        if (data) {
          const uniqueGenres = new Set<string>();
          data.forEach(release => {
            release.genres.forEach((genre: string) => uniqueGenres.add(genre));
          });
          setGenres(Array.from(uniqueGenres).sort());
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
