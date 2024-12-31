-- Create user genre preferences table
CREATE TABLE user_genre_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  genre_group_id uuid REFERENCES genre_groups(id) ON DELETE CASCADE,
  weight integer DEFAULT 1 CHECK (weight >= 1 AND weight <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, genre_group_id)
);

-- Enable RLS
ALTER TABLE user_genre_preferences ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can view their own genre preferences"
  ON user_genre_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own genre preferences"
  ON user_genre_preferences FOR ALL
  USING (auth.uid() = user_id);