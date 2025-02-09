drop policy "Enable read access for authenticated users" on "public"."genre_groups";

drop policy "Enable read access for authenticated users" on "public"."genre_mappings";

drop policy "Users can like songs" on "public"."likes";

drop policy "Users can unlike songs" on "public"."likes";

drop policy "Users can view all likes" on "public"."likes";

drop policy "Enable read access for authenticated users" on "public"."releases";

drop policy "Songs are viewable by everyone" on "public"."songs";

drop policy "Users can manage own spotify connection" on "public"."spotify_connections";

drop policy "Users can view own spotify connection" on "public"."spotify_connections";

revoke delete on table "public"."likes" from "anon";

revoke insert on table "public"."likes" from "anon";

revoke references on table "public"."likes" from "anon";

revoke select on table "public"."likes" from "anon";

revoke trigger on table "public"."likes" from "anon";

revoke truncate on table "public"."likes" from "anon";

revoke update on table "public"."likes" from "anon";

revoke delete on table "public"."likes" from "authenticated";

revoke insert on table "public"."likes" from "authenticated";

revoke references on table "public"."likes" from "authenticated";

revoke select on table "public"."likes" from "authenticated";

revoke trigger on table "public"."likes" from "authenticated";

revoke truncate on table "public"."likes" from "authenticated";

revoke update on table "public"."likes" from "authenticated";

revoke delete on table "public"."likes" from "service_role";

revoke insert on table "public"."likes" from "service_role";

revoke references on table "public"."likes" from "service_role";

revoke select on table "public"."likes" from "service_role";

revoke trigger on table "public"."likes" from "service_role";

revoke truncate on table "public"."likes" from "service_role";

revoke update on table "public"."likes" from "service_role";

revoke delete on table "public"."songs" from "anon";

revoke insert on table "public"."songs" from "anon";

revoke references on table "public"."songs" from "anon";

revoke select on table "public"."songs" from "anon";

revoke trigger on table "public"."songs" from "anon";

revoke truncate on table "public"."songs" from "anon";

revoke update on table "public"."songs" from "anon";

revoke delete on table "public"."songs" from "authenticated";

revoke insert on table "public"."songs" from "authenticated";

revoke references on table "public"."songs" from "authenticated";

revoke select on table "public"."songs" from "authenticated";

revoke trigger on table "public"."songs" from "authenticated";

revoke truncate on table "public"."songs" from "authenticated";

revoke update on table "public"."songs" from "authenticated";

revoke delete on table "public"."songs" from "service_role";

revoke insert on table "public"."songs" from "service_role";

revoke references on table "public"."songs" from "service_role";

revoke select on table "public"."songs" from "service_role";

revoke trigger on table "public"."songs" from "service_role";

revoke truncate on table "public"."songs" from "service_role";

revoke update on table "public"."songs" from "service_role";

alter table "public"."likes" drop constraint "likes_song_id_fkey";

alter table "public"."likes" drop constraint "likes_user_id_fkey";

alter table "public"."playlist_songs" drop constraint "playlist_songs_song_id_fkey";

alter table "public"."spotify_connections" drop constraint "spotify_connections_user_id_fkey";

alter table "public"."user_genre_preferences" drop constraint "user_genre_preferences_weight_check";

drop function if exists "public"."import_album"(album_data jsonb, importing_user_id uuid);

drop function if exists "public"."import_from_spotify"(spotify_urls text[], importing_user_id uuid);

drop function if exists "public"."is_admin"(user_id uuid);

alter table "public"."likes" drop constraint "likes_pkey";

alter table "public"."songs" drop constraint "songs_pkey";

drop index if exists "public"."likes_pkey";

drop index if exists "public"."songs_pkey";

drop table "public"."likes";

drop table "public"."songs";

alter table "public"."profiles" add column "spotify_connected" boolean default false;

alter table "public"."spotify_connections" drop column "updated_at";

alter table "public"."spotify_connections" add column "spotify_id" text not null;

alter table "public"."spotify_connections" alter column "expires_at" set default now();

alter table "public"."spotify_connections" alter column "user_id" set not null;

alter table "public"."user_genre_preferences" alter column "weight" drop default;

alter table "public"."user_genre_preferences" alter column "weight" set data type real using "weight"::real;

alter table "public"."spotify_connections" add constraint "spotify_connections_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."spotify_connections" validate constraint "spotify_connections_user_id_fkey";

alter table "public"."user_genre_preferences" add constraint "user_genre_preferences_weight_check" CHECK (((weight >= (0)::double precision) AND (weight <= (5)::double precision))) not valid;

alter table "public"."user_genre_preferences" validate constraint "user_genre_preferences_weight_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.refresh_release_listings_view()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  refresh materialized view concurrently release_listings;
  return null;
end;
$function$
;

create materialized view "public"."release_listings" as  SELECT r.id,
    r.name,
    r.release_type,
    r.cover_url,
    r.genres,
    r.record_label,
    r.created_at,
    r.release_date,
    array_agg(DISTINCT rg.genre_id) AS genre_ids,
    array_agg(DISTINCT g.name) AS genre_names,
    ( SELECT jsonb_agg(artists.artist_info ORDER BY (artists.artist_info ->> 'position'::text)) AS jsonb_agg
           FROM ( SELECT DISTINCT jsonb_build_object('position', ra."position", 'artist_name', a.name) AS artist_info
                   FROM (release_artists ra
                     JOIN artists a ON ((a.id = ra.artist_id)))
                  WHERE (ra.release_id = r.id)) artists) AS artists
   FROM ((releases r
     LEFT JOIN release_genres rg ON ((rg.release_id = r.id)))
     LEFT JOIN genres g ON ((g.id = rg.genre_id)))
  GROUP BY r.id, r.name, r.release_type, r.cover_url, r.genres, r.record_label, r.created_at, r.release_date;


CREATE OR REPLACE FUNCTION public.update_release_transaction(p_release_id uuid, p_release_data jsonb, p_artist_ids uuid[], p_tracks track_input[], p_track_credits track_credit_input[])
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
        IF p_release_id IS NULL THEN
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

            p_release_id := v_new_release_id;
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
            WHERE id = p_release_id;

            -- Delete existing relationships and tracks
            DELETE FROM public.release_artists WHERE release_id = p_release_id;
            DELETE FROM public.tracks WHERE release_id = p_release_id;
        END IF;

        -- Insert artist relationships
        FOR i IN 1..array_length(p_artist_ids, 1)
        LOOP
            INSERT INTO public.release_artists (release_id, artist_id, position)
            VALUES (p_release_id, p_artist_ids[i], i - 1);
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
                    p_release_id,
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
$function$
;

CREATE OR REPLACE FUNCTION public.column_exists(table_name text, column_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  return exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
    and table_name = $1
    and column_name = $2
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.create_or_update_release_transaction(p_artist_ids uuid[], p_release_data jsonb, p_track_credits track_credit_input[], p_tracks track_input[])
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
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
            ) VALUES (
                (p_release_data->>'name')::text,
                (p_release_data->>'release_type')::text,
                (p_release_data->>'cover_url')::text,
                (p_release_data->>'genres')::text[],
                (p_release_data->>'record_label')::text,
                (p_release_data->>'track_count')::integer,
                (p_release_data->>'spotify_url')::text,
                (p_release_data->>'apple_music_url')::text,
                (p_release_data->>'release_date')::date,
                (p_release_data->>'description')::text,
                (p_release_data->>'description_author_id')::uuid,
                (p_release_data->>'created_by')::uuid,
                (p_release_data->>'updated_at')::timestamp
            )
            RETURNING id INTO v_track_id;

            -- Set the ID in release_data
            p_release_data := jsonb_set(p_release_data, '{id}', to_jsonb(v_track_id));
        ELSE
            -- Update existing release
            UPDATE public.releases SET
                name = (p_release_data->>'name')::text,
                release_type = (p_release_data->>'release_type')::text,
                cover_url = (p_release_data->>'cover_url')::text,
                genres = (p_release_data->>'genres')::text[],
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

            -- Insert track credits if any exist for this track
            FOR v_credit IN 
                SELECT * FROM unnest(p_track_credits) 
                WHERE track_number = v_track.track_number
            LOOP
                INSERT INTO public.track_credits (
                    track_id,
                    name,
                    role
                ) VALUES (
                    v_track_id,
                    v_credit.name,
                    v_credit.role
                );
            END LOOP;
        END LOOP;

        -- If we get here, commit the transaction
        COMMIT;
    EXCEPTION WHEN OTHERS THEN
        -- If anything fails, roll back the entire transaction
        ROLLBACK;
        RAISE;
    END;
END;
$function$
;

CREATE INDEX release_listings_created_at_idx ON public.release_listings USING btree (created_at DESC);

CREATE INDEX release_listings_genre_names_idx ON public.release_listings USING gin (genre_names);

CREATE INDEX release_listings_release_type_idx ON public.release_listings USING btree (release_type);

create policy "Allow public read access to genre_groups"
on "public"."genre_groups"
as permissive
for select
to public
using (true);


create policy "Allow public read access to genre_mappings"
on "public"."genre_mappings"
as permissive
for select
to public
using (true);


create policy "Users can delete their own Spotify connection"
on "public"."spotify_connections"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can insert their own Spotify connection"
on "public"."spotify_connections"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own Spotify connection"
on "public"."spotify_connections"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own Spotify connection"
on "public"."spotify_connections"
as permissive
for select
to public
using ((auth.uid() = user_id));


CREATE TRIGGER release_listings_refresh_on_genres AFTER INSERT OR DELETE OR UPDATE ON public.release_genres FOR EACH STATEMENT EXECUTE FUNCTION refresh_release_listings_view();

CREATE TRIGGER release_listings_refresh_on_releases AFTER INSERT OR DELETE OR UPDATE ON public.releases FOR EACH STATEMENT EXECUTE FUNCTION refresh_release_listings_view();


