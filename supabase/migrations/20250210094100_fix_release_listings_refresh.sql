-- Drop existing triggers
DROP TRIGGER IF EXISTS release_listings_refresh_on_genres ON public.release_genres;
DROP TRIGGER IF EXISTS release_listings_refresh_on_releases ON public.releases;

-- Update the refresh function to remove CONCURRENT keyword
CREATE OR REPLACE FUNCTION public.refresh_release_listings_view()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  -- Remove CONCURRENT to prevent conflicts
  refresh materialized view release_listings;
  return null;
end;
$function$;

-- Create a single trigger that watches both tables
CREATE TRIGGER release_listings_refresh
AFTER INSERT OR UPDATE OR DELETE ON public.releases
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_release_listings_view();

-- Add comment for documentation
COMMENT ON FUNCTION public.refresh_release_listings_view IS 'Refreshes the release_listings materialized view without concurrency to prevent refresh conflicts';
