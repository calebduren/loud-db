import { supabase } from "../supabase";
import { logger } from "../utils/logger";

interface GenreGroup {
  id: number;
  name: string;
}

interface GenreMapping {
  genre: string;
  genre_id: string;
  group_id: number;
  genres?: {
    name: string;
  } | null;
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
  if (!genreName?.trim()) {
    logger.warn('Attempted to find/create genre with empty name');
    throw new Error('Genre name cannot be empty');
  }

  const normalizedName = genreName.trim().toLowerCase();
  
  logger.debug('Finding or creating genre', { name: normalizedName });

  try {
    // First try to find the genre
    const { data: existingGenre, error: findError } = await supabase
      .from("genres")
      .select("id")
      .eq("name", normalizedName)
      .single();

    if (findError && findError.code !== "PGRST116") { // PGRST116 is "not found"
      logger.error('Error finding genre', { error: findError, name: normalizedName });
      throw findError;
    }

    if (existingGenre) {
      logger.debug('Found existing genre', { id: existingGenre.id, name: normalizedName });
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
        logger.debug('Genre was created concurrently, fetching', { name: normalizedName });
        const { data: genre, error: refindError } = await supabase
          .from("genres")
          .select("id")
          .eq("name", normalizedName)
          .single();

        if (refindError) {
          logger.error('Error re-finding genre after concurrent creation', { error: refindError, name: normalizedName });
          throw refindError;
        }

        logger.debug('Found concurrently created genre', { id: genre.id, name: normalizedName });
        return genre.id;
      }
      logger.error('Error creating genre', { error: createError, name: normalizedName });
      throw createError;
    }

    logger.debug('Created new genre', { id: newGenre.id, name: normalizedName });
    return newGenre.id;
  } catch (error) {
    logger.error('Unexpected error in findOrCreateGenre', { error, name: normalizedName });
    throw error;
  }
}

export async function fetchGenreGroups(): Promise<Record<string, string[]>> {
  try {
    logger.debug('Fetching genre groups');

    // First fetch just the groups
    const { data: groups, error: groupsError } = await supabase
      .from("genre_groups")
      .select("id, name")
      .order("name");

    if (groupsError) {
      logger.error('Error fetching genre groups', { error: groupsError });
      return {}; // Return empty map instead of throwing
    }

    if (!groups?.length) {
      logger.debug('No genre groups found');
      return {};
    }

    // Then fetch mappings with a left join to genres
    const { data: mappings, error: mappingsError } = await supabase
      .from("genre_mappings")
      .select(`
        genre,
        genre_id,
        group_id,
        genres:genres(
          name
        )
      `);

    if (mappingsError) {
      logger.error('Error fetching genre mappings', { error: mappingsError });
      return {}; // Return empty map instead of throwing
    }

    // Create mapping of group names to genres
    const groupMap: Record<string, string[]> = {};
    groups.forEach((group: GenreGroup) => {
      if (!group?.name) {
        logger.warn('Found genre group without name', { group });
        return;
      }

      // First try to get genres from the new relationship
      const groupGenres = (mappings || [])
        .filter((mapping: GenreMapping) => mapping?.group_id === group.id)
        .map((mapping: GenreMapping) => {
          // First try the genres relationship
          if (mapping?.genres?.name) {
            return mapping.genres.name;
          }
          // Fall back to the old genre field
          return mapping?.genre;
        })
        .filter((name): name is string => Boolean(name?.trim())) // Remove any nulls/undefined/empty strings
        .sort();

      // Only add groups that have genres
      if (groupGenres.length > 0) {
        groupMap[group.name] = groupGenres;
      }
    });

    logger.debug('Successfully fetched genre groups', { 
      groupCount: groups.length,
      mappingCount: mappings?.length || 0,
      groups: Object.keys(groupMap)
    });

    return groupMap;
  } catch (error) {
    logger.error('Error in fetchGenreGroups', { error });
    // Return empty mapping instead of throwing to prevent UI disruption
    return {};
  }
}
