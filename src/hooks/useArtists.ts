import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Artist } from '../types/database';

export function useArtists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    const { data } = await supabase
      .from('artists')
      .select('*')
      .order('name');
    if (data) setArtists(data);
    setLoading(false);
  };

  return { artists, loading };
}