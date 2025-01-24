-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to import an album
CREATE OR REPLACE FUNCTION import_album(
  album_data jsonb,
  importing_user_id uuid
)
RETURNS jsonb AS $$
DECLARE
  release_id uuid;
  artist_record RECORD;
  track_record RECORD;
  credit_record RECORD;
BEGIN
  -- Insert the release
  INSERT INTO releases (
    name,
    release_type,
    cover_url,
    genres,
    spotify_url,
    release_date,
    created_by
  ) VALUES (
    (album_data->>'name')::text,
    (album_data->>'release_type')::text,
    (album_data->>'cover_url')::text,
    (album_data->'genres')::jsonb,
    (album_data->>'spotify_url')::text,
    (album_data->>'release_date')::date,
    importing_user_id
  )
  ON CONFLICT (spotify_url) DO UPDATE SET
    name = EXCLUDED.name,
    release_type = EXCLUDED.release_type,
    cover_url = EXCLUDED.cover_url,
    genres = EXCLUDED.genres,
    release_date = EXCLUDED.release_date,
    updated_at = now()
  RETURNING id INTO release_id;

  -- Insert artists
  FOR artist_record IN SELECT * FROM jsonb_array_elements(album_data->'artists')
  LOOP
    INSERT INTO artists (name, release_id)
    VALUES (
      (artist_record.value->>'name')::text,
      release_id
    );
  END LOOP;

  -- Insert tracks
  FOR track_record IN SELECT * FROM jsonb_array_elements(album_data->'tracks')
  LOOP
    WITH inserted_track AS (
      INSERT INTO tracks (
        name,
        track_number,
        duration_ms,
        preview_url,
        release_id
      ) VALUES (
        (track_record.value->>'name')::text,
        (track_record.value->>'track_number')::integer,
        (track_record.value->>'duration_ms')::integer,
        (track_record.value->>'preview_url')::text,
        release_id
      )
      RETURNING id
    )
    -- Insert credits for each track
    INSERT INTO credits (
      name,
      role,
      track_id
    )
    SELECT 
      (credit.value->>'name')::text,
      (credit.value->>'role')::text,
      inserted_track.id
    FROM inserted_track,
    jsonb_array_elements(track_record.value->'credits') AS credit;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'release_id', release_id
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the main import function that will be called from the client
CREATE OR REPLACE FUNCTION import_from_spotify(
  spotify_urls text[],
  importing_user_id uuid DEFAULT auth.uid()
)
RETURNS jsonb AS $$
DECLARE
  imported_count integer := 0;
  failed_count integer := 0;
  imported_albums text[] := ARRAY[]::text[];
  failed_albums text[] := ARRAY[]::text[];
  current_url text;
  import_result jsonb;
BEGIN
  -- Check if user is admin
  IF NOT is_admin(importing_user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: User is not an admin'
    );
  END IF;

  -- Process each URL
  FOREACH current_url IN ARRAY spotify_urls
  LOOP
    -- You would typically fetch album data from Spotify here
    -- For now, we'll just return a mock success
    import_result := jsonb_build_object(
      'success', true,
      'name', 'Mock Album ' || imported_count + 1,
      'release_type', 'album',
      'cover_url', 'https://example.com/cover.jpg',
      'genres', '["indie"]',
      'spotify_url', current_url,
      'release_date', current_date,
      'artists', '[{"name": "Mock Artist"}]',
      'tracks', '[{"name": "Mock Track", "track_number": 1, "duration_ms": 180000, "preview_url": null, "credits": [{"name": "Mock Artist", "role": "Artist"}]}]'
    );

    -- Import the album
    import_result := import_album(import_result, importing_user_id);

    IF (import_result->>'success')::boolean THEN
      imported_count := imported_count + 1;
      imported_albums := array_append(imported_albums, current_url);
    ELSE
      failed_count := failed_count + 1;
      failed_albums := array_append(failed_albums, current_url);
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'importedCount', imported_count,
    'failedCount', failed_count,
    'importedAlbums', imported_albums,
    'failedAlbums', failed_albums
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
