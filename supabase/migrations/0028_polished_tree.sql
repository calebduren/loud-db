/*
  # Create releases view with denormalized data

  Creates a view that joins releases with their artists and formats the data
  for easier consumption by the client.
*/

CREATE OR REPLACE VIEW releases_view AS
SELECT 
  r.*,
  -- Convert artists array to JSON string
  (
    SELECT json_agg(json_build_object(
      'position', ra.position,
      'artist', json_build_object(
        'id', a.id,
        'name', a.name
      )
    ) ORDER BY ra.position)
    FROM release_artists ra
    JOIN artists a ON a.id = ra.artist_id
    WHERE ra.release_id = r.id
  ) as artists_json
FROM releases r;

-- Grant access to the view
GRANT SELECT ON releases_view TO authenticated;
GRANT SELECT ON releases_view TO anon;