-- Safe migration that doesn't drop anything
DO $$ 
BEGIN
    -- Only create types if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'track_input') THEN
        CREATE TYPE public.track_input AS (
            name text,
            track_number integer,
            duration_ms integer,
            preview_url text
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'track_credit_input') THEN
        CREATE TYPE public.track_credit_input AS (
            track_number integer,
            name text,
            role text
        );
    END IF;
END $$;

-- Create or replace the function with the exact signature
CREATE OR REPLACE FUNCTION public.create_or_update_release_transaction(
    p_artist_ids uuid[],
    p_release_data jsonb,
    p_track_credits track_credit_input[],
    p_tracks track_input[]
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_track record;
    v_credit record;
    v_artist_id uuid;
    v_track_id uuid;
    i integer;
BEGIN
    -- Insert or update the release
    IF (p_release_data->>'id')::uuid IS NULL THEN
        -- Insert new release
        INSERT INTO public.releases (
            name,
            release_type,
            cover_url,
            genres,
            record_label,
            track_count,
            spotify_url,
            apple_music_url,
            release_date,
            description,
            description_author_id,
            created_by,
            updated_at
        ) VALUES (
            (p_release_data->>'name')::text,
            (p_release_data->>'release_type')::text,
            (p_release_data->>'cover_url')::text,
            (p_release_data->>'genres')::text[],
            (p_release_data->>'record_label')::text,
            (p_release_data->>'track_count')::integer,
            (p_release_data->>'spotify_url')::text,
            (p_release_data->>'apple_music_url')::text,
            (p_release_data->>'release_date')::date,
            (p_release_data->>'description')::text,
            (p_release_data->>'description_author_id')::uuid,
            (p_release_data->>'created_by')::uuid,
            (p_release_data->>'updated_at')::timestamp
        )
        RETURNING id INTO v_track_id;

        -- Set the ID in release_data
        p_release_data := jsonb_set(p_release_data, '{id}', to_jsonb(v_track_id));
    ELSE
        -- Update existing release
        UPDATE public.releases SET
            name = (p_release_data->>'name')::text,
            release_type = (p_release_data->>'release_type')::text,
            cover_url = (p_release_data->>'cover_url')::text,
            genres = (p_release_data->>'genres')::text[],
            record_label = (p_release_data->>'record_label')::text,
            track_count = (p_release_data->>'track_count')::integer,
            spotify_url = (p_release_data->>'spotify_url')::text,
            apple_music_url = (p_release_data->>'apple_music_url')::text,
            release_date = (p_release_data->>'release_date')::date,
            description = (p_release_data->>'description')::text,
            description_author_id = (p_release_data->>'description_author_id')::uuid,
            updated_at = (p_release_data->>'updated_at')::timestamp
        WHERE id = (p_release_data->>'id')::uuid;

        -- Delete existing relationships and tracks
        DELETE FROM public.release_artists WHERE release_id = (p_release_data->>'id')::uuid;
        DELETE FROM public.tracks WHERE release_id = (p_release_data->>'id')::uuid;
    END IF;

    -- Insert artist relationships
    FOR i IN 1..array_length(p_artist_ids, 1)
    LOOP
        INSERT INTO public.release_artists (release_id, artist_id, position)
        VALUES ((p_release_data->>'id')::uuid, p_artist_ids[i], i - 1);
    END LOOP;

    -- Insert tracks
    FOR v_track IN SELECT * FROM unnest(p_tracks)
    LOOP
        INSERT INTO public.tracks (
            release_id,
            name,
            track_number,
            duration_ms,
            preview_url
        )
        VALUES (
            (p_release_data->>'id')::uuid,
            v_track.name,
            v_track.track_number,
            v_track.duration_ms,
            v_track.preview_url
        )
        RETURNING id INTO v_track_id;

        -- Insert track credits if any exist for this track
        FOR v_credit IN 
            SELECT * FROM unnest(p_track_credits) 
            WHERE track_number = v_track.track_number
        LOOP
            INSERT INTO public.track_credits (
                track_id,
                name,
                role
            ) VALUES (
                v_track_id,
                v_credit.name,
                v_credit.role
            );
        END LOOP;
    END LOOP;

EXCEPTION WHEN OTHERS THEN
    RAISE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_or_update_release_transaction TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.create_or_update_release_transaction IS 'Handles atomic creation or update of a release, including artists, tracks, and credits';
