-- Update weight constraint to allow 0
ALTER TABLE user_genre_preferences
DROP CONSTRAINT user_genre_preferences_weight_check,
ADD CONSTRAINT user_genre_preferences_weight_check 
  CHECK (weight >= 0 AND weight <= 5);