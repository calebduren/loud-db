-- Drop existing function and types if they exist
DROP FUNCTION IF EXISTS public.create_or_update_release_transaction;
DROP TYPE IF EXISTS public.track_input;
DROP TYPE IF EXISTS public.track_credit_input;

-- Create custom types for our parameters
CREATE TYPE public.track_input AS (
    name text,
    track_number integer,
    duration_ms integer,
    preview_url text
);

CREATE TYPE public.track_credit_input AS (
    track_number integer,
    name text,
    role text
);

-- Create the stored procedure
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
    v_new_release_id uuid;
    v_track record;
    v_credit record;
    v_artist_id uuid;
    v_track_id uuid;
    i integer;
BEGIN
    -- Start a transaction
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
            )
            SELECT
                (p_release_data->>'name')::text,
                (p_release_data->>'release_type')::text,
                (p_release_data->>'cover_url')::text,
                (p_release_data->>'genres')::jsonb,
                (p_release_data->>'record_label')::text,
                (p_release_data->>'track_count')::integer,
                (p_release_data->>'spotify_url')::text,
                (p_release_data->>'apple_music_url')::text,
                (p_release_data->>'release_date')::date,
                (p_release_data->>'description')::text,
                (p_release_data->>'description_author_id')::uuid,
                (p_release_data->>'created_by')::uuid,
                (p_release_data->>'updated_at')::timestamp
            RETURNING id INTO v_new_release_id;

            p_release_data := jsonb_set(p_release_data, '{id}', to_jsonb(v_new_release_id));
        ELSE
            -- Update existing release
            UPDATE public.releases
            SET
                name = (p_release_data->>'name')::text,
                release_type = (p_release_data->>'release_type')::text,
                cover_url = (p_release_data->>'cover_url')::text,
                genres = (p_release_data->>'genres')::jsonb,
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
        IF array_length(p_tracks, 1) > 0 THEN
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

                -- Insert track credits for this track
                FOR v_credit IN 
                    SELECT * FROM unnest(p_track_credits) 
                    WHERE track_number = v_track.track_number
                LOOP
                    INSERT INTO public.track_credits (
                        track_id,
                        name,
                        role
                    )
                    VALUES (
                        v_track_id,
                        v_credit.name,
                        v_credit.role
                    );
                END LOOP;
            END LOOP;
        END IF;

    EXCEPTION WHEN OTHERS THEN
        -- Rollback the entire transaction on any error
        RAISE EXCEPTION 'Transaction failed: %', SQLERRM;
    END;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_or_update_release_transaction TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.create_or_update_release_transaction IS 'Handles atomic creation or update of a release, including artists, tracks, and credits';
