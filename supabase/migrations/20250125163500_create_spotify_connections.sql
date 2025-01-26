-- Create spotify_connections table
create table if not exists spotify_connections (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade not null,
  spotify_id text not null,
  access_token text not null,
  refresh_token text not null,
  unique(user_id)
);

-- Set up RLS (Row Level Security)
alter table spotify_connections enable row level security;

-- Create policies
create policy "Users can view their own Spotify connection"
  on spotify_connections for select
  using (auth.uid() = user_id);

create policy "Users can insert their own Spotify connection"
  on spotify_connections for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own Spotify connection"
  on spotify_connections for update
  using (auth.uid() = user_id);

create policy "Users can delete their own Spotify connection"
  on spotify_connections for delete
  using (auth.uid() = user_id);
