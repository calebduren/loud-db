/*
  # Fix releases view with proper JSON handling

  Updates the releases view to properly handle JSON data and adds missing columns.
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
  ) as artists_json
FROM releases r;

-- Grant access to the view
GRANT SELECT ON releases_view TO authenticated;
GRANT SELECT ON releases_view TO anon;