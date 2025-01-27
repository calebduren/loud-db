-- Add expires_at column to spotify_connections table if it doesn't exist
DO $$ 
BEGIN
    -- Add the column if it doesn't exist
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'spotify_connections'
    ) AND NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'spotify_connections' 
        AND column_name = 'expires_at'
    ) THEN
        RAISE NOTICE 'Adding expires_at column to spotify_connections table';
        
        ALTER TABLE spotify_connections 
        ADD COLUMN expires_at timestamptz NOT NULL DEFAULT now();

        -- Update existing rows to have a default expiration time (1 hour from their created_at)
        UPDATE spotify_connections 
        SET expires_at = created_at + interval '1 hour'
        WHERE expires_at = now();
        
        RAISE NOTICE 'Successfully added expires_at column';
    ELSE
        RAISE NOTICE 'Table spotify_connections or column expires_at already exists, skipping';
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Error adding expires_at column: %', SQLERRM;
END $$;
