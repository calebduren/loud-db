-- Create new genres table
CREATE TABLE IF NOT EXISTS public.genres (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create release_genres junction table
CREATE TABLE IF NOT EXISTS public.release_genres (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    release_id uuid REFERENCES public.releases(id) ON DELETE CASCADE,
    genre_id uuid REFERENCES public.genres(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(release_id, genre_id)
);

-- Modify genre_mappings to use genre_id instead of genre string
ALTER TABLE public.genre_mappings 
    ADD COLUMN genre_id uuid REFERENCES public.genres(id);

-- Migration function to populate genres table and update references
CREATE OR REPLACE FUNCTION migrate_genres()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    release_record record;
    genre_text text;
    genre_id uuid;
BEGIN
    -- First, extract all unique genres from releases and insert into genres table
    FOR genre_text IN 
        SELECT DISTINCT unnest(genres)
        FROM releases
        WHERE genres IS NOT NULL
    LOOP
        INSERT INTO genres (name)
        VALUES (genre_text)
        ON CONFLICT (name) DO NOTHING
        RETURNING id INTO genre_id;
        
        -- If we didn't get an id from the insert, get it from the existing record
        IF genre_id IS NULL THEN
            SELECT id INTO genre_id FROM genres WHERE name = genre_text;
        END IF;
    END LOOP;

    -- Now populate release_genres
    FOR release_record IN 
        SELECT id, genres 
        FROM releases 
        WHERE genres IS NOT NULL
    LOOP
        INSERT INTO release_genres (release_id, genre_id)
        SELECT DISTINCT release_record.id, g.id
        FROM (
            SELECT unnest(release_record.genres) as genre_name
        ) AS genres
        JOIN genres g ON g.name = genres.genre_name
        ON CONFLICT DO NOTHING;
    END LOOP;

    -- Update genre_mappings to use new genre_id
    UPDATE genre_mappings gm
    SET genre_id = g.id
    FROM genres g
    WHERE g.name = gm.genre;
END;
$$;

-- Add necessary indexes
CREATE INDEX IF NOT EXISTS idx_release_genres_release_id ON release_genres(release_id);
CREATE INDEX IF NOT EXISTS idx_release_genres_genre_id ON release_genres(genre_id);
CREATE INDEX IF NOT EXISTS idx_genres_name ON genres(name);

-- Grant appropriate permissions
GRANT SELECT, INSERT, UPDATE ON genres TO authenticated;
GRANT SELECT, INSERT, UPDATE ON release_genres TO authenticated;
GRANT SELECT ON genre_groups TO authenticated;
GRANT SELECT ON genre_mappings TO authenticated;

-- Add RLS policies
ALTER TABLE genre_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE genre_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON genre_groups
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable read access for authenticated users" ON genre_mappings
    FOR SELECT
    TO authenticated
    USING (true);

-- Execute the migration function
SELECT migrate_genres();
