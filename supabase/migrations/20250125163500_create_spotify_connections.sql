-- Create spotify_connections table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'spotify_connections'
    ) THEN
        CREATE TABLE spotify_connections (
            id uuid primary key default gen_random_uuid(),
            created_at timestamptz default now(),
            user_id uuid references auth.users(id) on delete cascade not null,
            spotify_id text not null,
            access_token text not null,
            refresh_token text not null,
            unique(user_id)
        );

        -- Set up RLS
        ALTER TABLE spotify_connections ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Users can view their own Spotify connection"
            ON spotify_connections FOR SELECT
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert their own Spotify connection"
            ON spotify_connections FOR INSERT
            WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own Spotify connection"
            ON spotify_connections FOR UPDATE
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own Spotify connection"
            ON spotify_connections FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;
