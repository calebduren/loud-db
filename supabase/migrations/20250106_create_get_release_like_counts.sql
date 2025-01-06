-- Create a function to get all release like counts
create or replace function get_release_like_counts()
returns table (
    release_id uuid,
    count bigint
) language sql as $$
    SELECT release_id, COUNT(*) as count
    FROM release_likes
    GROUP BY release_id;
$$;
