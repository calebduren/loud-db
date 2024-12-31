-- Create track credits table
CREATE TABLE track_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid REFERENCES tracks(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE track_credits ENABLE ROW LEVEL SECURITY;

-- Add policies for track credits
CREATE POLICY "Track credits are viewable by everyone"
  ON track_credits FOR SELECT
  USING (true);

CREATE POLICY "Only admin users can manage track credits"
  ON track_credits FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'creator')
    )
  );

-- Add indexes
CREATE INDEX idx_track_credits_track_id ON track_credits(track_id);