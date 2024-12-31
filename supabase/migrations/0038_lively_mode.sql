-- Drop existing view
DROP VIEW IF EXISTS releases_view;

-- Recreate view with proper join for description author
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
  r.description,
  -- Join with profiles table for description author
  CASE WHEN r.description_author_id IS NOT NULL THEN
    jsonb_build_object(
      'id', p.id,
      'username', p.username
    )
  ELSE NULL END as description_author,
  -- Artists array
  COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'position', ra.position,
          'artist', jsonb_build_object(
            'id', a.id,
            'name', a.name
          )
        ) ORDER BY ra.position
      )
      FROM release_artists ra
      JOIN artists a ON a.id = ra.artist_id
      WHERE ra.release_id = r.id
    ),
    '[]'::jsonb
  ) as artists,
  -- Tracks array
  COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', t.id,
          'name', t.name,
          'duration_ms', t.duration_ms,
          'track_number', t.track_number,
          'preview_url', t.preview_url,
          'track_credits', COALESCE(
            (
              SELECT jsonb_agg(
                jsonb_build_object(
                  'id', tc.id,
                  'name', tc.name,
                  'role', tc.role
                )
              )
              FROM track_credits tc
              WHERE tc.track_id = t.id
            ),
            '[]'::jsonb
          )
        ) ORDER BY t.track_number
      )
      FROM tracks t
      WHERE t.release_id = r.id
    ),
    '[]'::jsonb
  ) as tracks
FROM releases r
LEFT JOIN profiles p ON p.id = r.description_author_id;

-- Grant access to the view
GRANT SELECT ON releases_view TO authenticated;
GRANT SELECT ON releases_view TO anon;