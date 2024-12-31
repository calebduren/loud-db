/*
  # Add release description field

  1. Changes
    - Add description text field to releases table
    - Add description_author_id reference to profiles table
    - Update releases_view to include description and author info
*/

-- Add description fields to releases table
ALTER TABLE releases
ADD COLUMN description text,
ADD COLUMN description_author_id uuid REFERENCES profiles(id);

-- Update releases view to include description and author info
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
  r.description,
  CASE WHEN r.description_author_id IS NOT NULL THEN
    json_build_object(
      'id', p.id,
      'username', p.username
    )
  ELSE NULL END as description_author,
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
FROM releases r
LEFT JOIN profiles p ON p.id = r.description_author_id;