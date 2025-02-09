-- Grant SELECT permissions on genre-related tables to authenticated users
GRANT SELECT ON genres TO authenticated;
GRANT SELECT ON genre_groups TO authenticated;
GRANT SELECT ON genre_mappings TO authenticated;
