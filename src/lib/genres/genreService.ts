import { supabase } from "../supabase";
import { logger } from "../utils/logger";

interface GenreGroup {
  id: string;
  name: string;
}

interface Genre {
  id: string;
  name: string;
}

interface GenreMapping {
  genre: string;
  genre_id: string | null;
  group_id: string;
}

export async function fetchGenreGroups(): Promise<Record<string, string[]>> {
  try {
    // Fetch genre groups and their mappings
    const { data: groups, error: groupsError } = await supabase
      .from('genre_groups')
      .select('id, name');

    if (groupsError) {
      return {};
    }

    if (!groups || groups.length === 0) {
      return {};
    }

    // Get all genre mappings with genre names
    const { data: mappings, error: mappingsError } = await supabase
      .from('genre_mappings')
      .select(`
        genre,
        genre_id,
        group_id
      `);

    if (mappingsError) {
      return {};
    }

    // Create mapping of group names to genres
    const groupMap: Record<string, string[]> = {};
    groups.forEach((group) => {
      const groupGenres = mappings
        ?.filter((m) => m.group_id === group.id)
        .map((m) => m.genre);
      groupMap[group.name] = groupGenres || [];
    });

    return groupMap;
  } catch (error) {
    return {};
  }
}

export async function findOrCreateGenre(genreName: string): Promise<string> {
  if (!genreName?.trim()) {
    logger.warn("Attempted to find/create genre with empty name");
    throw new Error("Genre name cannot be empty");
  }

  const normalizedName = genreName.trim().toLowerCase();

  logger.debug("Finding or creating genre", { name: normalizedName });

  try {
    // First try to find the genre
    const { data: existingGenre, error: findError } = await supabase
      .from("genres")
      .select("id")
      .eq("name", normalizedName)
      .single();

    if (findError && findError.code !== "PGRST116") {
      // PGRST116 is "not found"
      logger.error("Error finding genre", {
        error: findError,
        name: normalizedName,
      });
      throw findError;
    }

    if (existingGenre?.id) {
      logger.debug("Found existing genre", {
        id: existingGenre.id,
        name: normalizedName,
      });
      return existingGenre.id;
    }

    // If not found, create it
    const { data: newGenre, error: createError } = await supabase
      .from("genres")
      .insert({ name: normalizedName })
      .select()
      .single();

    if (createError) {
      logger.error("Error creating genre", {
        error: createError,
        name: normalizedName,
      });
      throw createError;
    }

    if (!newGenre) {
      logger.error("Failed to create genre", { name: normalizedName });
      throw new Error("Failed to create genre");
    }

    logger.debug("Created new genre", {
      id: newGenre.id,
      name: normalizedName,
    });

    return newGenre.id;
  } catch (error) {
    logger.error("Unexpected error in findOrCreateGenre", {
      error,
      name: normalizedName,
    });
    throw error;
  }
}

export async function fixIncorrectGenreMappings() {
  logger.debug("Starting genre mapping fix...");

  // First get all genre groups
  const { data: groups, error: groupsError } = await supabase
    .from("genre_groups")
    .select("id, name");

  if (groupsError) {
    logger.error("Error fetching genre groups", { error: groupsError });
    return;
  }

  // Get all mappings with their genre groups
  const { data: mappings, error: mappingsError } = await supabase
    .from("genre_mappings")
    .select(`
      id,
      genre,
      group_id,
      genre_groups (
        id,
        name
      )
    `);

  if (mappingsError) {
    logger.error("Error fetching genre mappings", { error: mappingsError });
    return;
  }

  // Find mappings where the group name doesn't match
  const mismatchedMappings = mappings
    .filter(m => {
      const group = groups.find(g => g.id === m.group_id);
      return group && group.name !== m.genre_groups?.name;
    })
    .map(m => ({
      id: m.id,
      genre: m.genre,
      currentGroupId: m.group_id,
      currentGroupName: groups.find(g => g.id === m.group_id)?.name,
      intendedGroupName: m.genre_groups?.name,
      intendedGroupId: groups.find(g => g.name === m.genre_groups?.name)?.id
    }));

  logger.debug("Found mismatched mappings", {
    count: mismatchedMappings.length,
    examples: mismatchedMappings.slice(0, 5)
  });

  // Update each incorrect mapping
  const updates = mismatchedMappings
    .filter(m => m.intendedGroupId) // Only update if we found the intended group
    .map(m => ({
      id: m.id,
      group_id: m.intendedGroupId
    }));

  if (updates.length === 0) {
    logger.debug("No mappings to update");
    return;
  }

  logger.debug("Updating incorrect mappings", {
    updateCount: updates.length,
    examples: updates.slice(0, 5)
  });

  // Update in batches of 100
  const batchSize = 100;
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    
    const { error: updateError } = await supabase
      .from("genre_mappings")
      .upsert(batch);

    if (updateError) {
      logger.error("Error updating batch", {
        error: updateError,
        batchStart: i,
        batchSize: batch.length
      });
    } else {
      logger.debug("Successfully updated batch", {
        batchStart: i,
        batchSize: batch.length
      });
    }
  }

  logger.debug("Finished updating genre mappings");
}

export async function analyzeGenreMappings() {
  logger.debug("Analyzing genre mappings...");

  // First get all genre groups
  const { data: groups, error: groupsError } = await supabase
    .from("genre_groups")
    .select("id, name");

  if (groupsError) {
    logger.error("Error fetching genre groups", { error: groupsError });
    return;
  }

  // Get all mappings with their genre groups
  const { data: mappings, error: mappingsError } = await supabase
    .from("genre_mappings")
    .select(`
      id,
      genre,
      group_id,
      genre_groups (
        id,
        name
      )
    `);

  if (mappingsError) {
    logger.error("Error fetching genre mappings", { error: mappingsError });
    return;
  }

  // Group mappings by their current group
  const mappingsByGroup = mappings.reduce((acc, mapping) => {
    const groupName = groups.find(g => g.id === mapping.group_id)?.name || 'Unknown';
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(mapping);
    return acc;
  }, {} as Record<string, any[]>);

  // Find incorrect mappings for each group
  const analysis = Object.entries(mappingsByGroup).map(([groupName, groupMappings]) => {
    const incorrectMappings = groupMappings.filter(m => 
      m.genre_groups?.name && m.genre_groups.name !== groupName
    );

    return {
      groupName,
      totalMappings: groupMappings.length,
      incorrectCount: incorrectMappings.length,
      examples: incorrectMappings
        .slice(0, 5)
        .map(m => ({
          genre: m.genre,
          currentGroup: groupName,
          intendedGroup: m.genre_groups?.name
        }))
    };
  })
  .filter(group => group.incorrectCount > 0)
  .sort((a, b) => b.incorrectCount - a.incorrectCount);

  logger.info("Genre Mapping Analysis", {
    totalGroups: groups.length,
    totalMappings: mappings.length,
    groupsWithIssues: analysis.length,
    analysis
  });

  return {
    groups,
    mappings,
    analysis
  };
}

export async function fixGenreMappingsByGroup(groupName: string) {
  logger.debug(`Fixing genre mappings for group: ${groupName}`);

  const { groups, mappings, analysis } = await analyzeGenreMappings();
  
  if (!groups || !mappings) {
    logger.error("Failed to get genre data");
    return;
  }

  const groupAnalysis = analysis.find(g => g.groupName === groupName);
  if (!groupAnalysis) {
    logger.debug(`No issues found for group: ${groupName}`);
    return;
  }

  // Find all incorrect mappings for this group
  const incorrectMappings = mappings.filter(m => {
    const currentGroupName = groups.find(g => g.id === m.group_id)?.name;
    return currentGroupName === groupName && m.genre_groups?.name !== groupName;
  });

  // Group the fixes by intended group
  const fixesByIntendedGroup = incorrectMappings.reduce((acc, mapping) => {
    const intendedGroup = mapping.genre_groups?.name || 'Unknown';
    if (!acc[intendedGroup]) {
      acc[intendedGroup] = [];
    }
    acc[intendedGroup].push(mapping);
    return acc;
  }, {} as Record<string, any[]>);

  // Show the proposed fixes
  logger.info(`Proposed fixes for ${groupName}:`, {
    totalIncorrect: incorrectMappings.length,
    byIntendedGroup: Object.entries(fixesByIntendedGroup).map(([intended, mappings]) => ({
      intendedGroup: intended,
      count: mappings.length,
      examples: mappings.slice(0, 3).map(m => m.genre)
    }))
  });

  // Return the analysis without making changes
  return {
    groupName,
    incorrectCount: incorrectMappings.length,
    fixesByIntendedGroup
  };
}
