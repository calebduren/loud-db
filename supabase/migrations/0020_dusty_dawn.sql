-- Remove unique constraint from genre_mappings
ALTER TABLE genre_mappings
DROP CONSTRAINT IF EXISTS genre_mappings_genre_key;

-- Add composite unique constraint to prevent duplicate mappings
ALTER TABLE genre_mappings
ADD CONSTRAINT genre_mappings_genre_group_unique UNIQUE (genre, group_id);

-- Update get_genre_group function to return array of groups
CREATE OR REPLACE FUNCTION get_genre_groups(input_genre text)
RETURNS text[]
LANGUAGE plpgsql
AS $$
DECLARE
  group_names text[];
BEGIN
  SELECT array_agg(g.name) INTO group_names
  FROM genre_mappings m
  JOIN genre_groups g ON g.id = m.group_id
  WHERE m.genre = input_genre;
  
  RETURN COALESCE(group_names, ARRAY[input_genre]);
END;
$$;