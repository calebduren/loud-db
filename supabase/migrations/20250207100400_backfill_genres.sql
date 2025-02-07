-- Backfill function to populate genres from genre_mappings
CREATE OR REPLACE FUNCTION backfill_genres_from_mappings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    mapping_record record;
    genre_id uuid;
BEGIN
    -- First, create genres from genre_mappings
    FOR mapping_record IN 
        SELECT DISTINCT genre 
        FROM genre_mappings 
        WHERE genre IS NOT NULL
    LOOP
        -- Insert if doesn't exist
        INSERT INTO genres (name)
        VALUES (mapping_record.genre)
        ON CONFLICT (name) DO NOTHING;
    END LOOP;

    -- Now update genre_mappings with the genre_ids
    UPDATE genre_mappings
    SET genre_id = g.id
    FROM genres g
    WHERE g.name = genre_mappings.genre
    AND genre_mappings.genre_id IS NULL;

    -- Create release_genres entries from the text array
    INSERT INTO release_genres (release_id, genre_id)
    SELECT DISTINCT r.id, g.id
    FROM releases r
    CROSS JOIN LATERAL unnest(r.genres) AS genre_name
    JOIN genres g ON g.name = genre_name::text
    ON CONFLICT ON CONSTRAINT release_genres_release_id_genre_id_key DO NOTHING;
END;
$$;

-- Execute the backfill
SELECT backfill_genres_from_mappings();

-- Drop the backfill function since we only need it once
DROP FUNCTION backfill_genres_from_mappings();
