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
  genre_id: string;
  group_id: number;
}

export interface Genre {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

/**
 * Finds or creates a genre by name
 * @param genreName The name of the genre to find or create
 * @returns The genre ID
 */
export async function findOrCreateGenre(genreName: string): Promise<string> {
  const normalizedName = genreName.trim().toLowerCase();
  
  // First try to find the genre
  const { data: existingGenre, error: findError } = await supabase
    .from("genres")
    .select("id")
    .eq("name", normalizedName)
    .single();

  if (findError && findError.code !== "PGRST116") { // PGRST116 is "not found"
    throw findError;
  }

  if (existingGenre) {
    return existingGenre.id;
  }

  // If not found, create it
  const { data: newGenre, error: createError } = await supabase
    .from("genres")
    .insert({ name: normalizedName })
    .select("id")
    .single();

  if (createError) {
    // If we got a unique violation, someone else created it first, try to get it
    if (createError.code === "23505") {
      const { data: genre, error: refindError } = await supabase
        .from("genres")
        .select("id")
        .eq("name", normalizedName)
        .single();

      if (refindError) {
        throw refindError;
      }

      return genre.id;
    }
    throw createError;
  }

  return newGenre.id;
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
          await supabase
            .from("genre_mappings")
            .select(`
              genre,
              genre_id,
              group_id,
              genres!inner (
                name
              )
            `),
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
