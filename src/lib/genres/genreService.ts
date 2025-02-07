import { supabase } from "../supabase";
import { fetchWithRetry } from "../utils/fetchUtils";

const RETRY_CONFIG = {
  maxAttempts: 3,
  delayMs: 1000,
  shouldRetry: (error: unknown) => {
    // Retry on network errors or rate limits
    if (error instanceof Error) {
      return (
        error.message.includes("Failed to fetch") ||
        error.message.includes("rate limit")
      );
    }
    return false;
  },
};

interface GenreGroup {
  id: number;
  name: string;
}

interface GenreMapping {
  genre: string;
  group_id: number;
}

export async function fetchGenreGroups(): Promise<Record<string, string[]>> {
  try {
    // Fetch both groups and mappings in parallel
    const [
      { data: groups, error: groupsError },
      { data: mappings, error: mappingsError },
    ] = await Promise.all([
      fetchWithRetry<{ data: GenreGroup[] | null; error: any }>(
        async () =>
          await supabase.from("genre_groups").select("id, name").order("name"),
        RETRY_CONFIG
      ),
      fetchWithRetry<{ data: GenreMapping[] | null; error: any }>(
        async () =>
          await supabase.from("genre_mappings").select("genre, group_id"),
        RETRY_CONFIG
      ),
    ]);

    if (groupsError) throw groupsError;
    if (mappingsError) throw mappingsError;

    // Create mapping of group names to genres
    const groupMap: Record<string, string[]> = {};
    (groups || []).forEach((group: GenreGroup) => {
      groupMap[group.name] = (mappings || [])
        .filter((mapping: GenreMapping) => mapping.group_id === group.id)
        .map((mapping: GenreMapping) => mapping.genre)
        .sort();
    });

    return groupMap;
  } catch (error) {
    console.error("Error fetching genre data:", error);
    // Return empty mapping instead of throwing to prevent UI disruption
    return {};
  }
}
