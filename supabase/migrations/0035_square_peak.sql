/*
  # Update releases view to include tracks

  1. Changes
    - Add tracks and track credits to the releases view
    - Ensure proper JSON aggregation of track data
    - Maintain existing release and artist data

  2. Benefits
    - Single query to fetch all release data
    - Improved performance by avoiding multiple queries
    - Consistent data structure
*/

DROP VIEW IF EXISTS releases_view;

CREATE VIEW releases_view AS
SELECT 
  r.id,
  r.name,
  r.release_type,
  r.cover_url,
  r.genres,
  r.record_label,
  r.track_count,
  r.spotify_url,
  r.apple_music_url,
  r.created_at,
  r.updated_at,
  r.created_by,
  r.release_date,
  COALESCE(
    (
      SELECT json_agg(
        json_build_object(
          'position', ra.position,
          'artist', json_build_object(
            'id', a.id,
            'name', a.name
          )
        ) ORDER BY ra.position
      )
      FROM release_artists ra
      JOIN artists a ON a.id = ra.artist_id
      WHERE ra.release_id = r.id
    ),
    '[]'::json
  ) as artists,
  COALESCE(
    (
      SELECT json_agg(
        json_build_object(
          'id', t.id,
          'name', t.name,
          'duration_ms', t.duration_ms,
          'track_number', t.track_number,
          'preview_url', t.preview_url,
          'track_credits', COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', tc.id,
                  'name', tc.name,
                  'role', tc.role
                )
              )
              FROM track_credits tc
              WHERE tc.track_id = t.id
            ),
            '[]'::json
          )
        ) ORDER BY t.track_number
      )
      FROM tracks t
      WHERE t.release_id = r.id
    ),
    '[]'::json
  ) as tracks
FROM releases r;