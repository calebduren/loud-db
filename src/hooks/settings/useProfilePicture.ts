import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../useAuth';
import { useToast } from '../useToast';
import { validateImage } from '../../lib/validation/imageValidation';

export function useProfilePicture() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  const uploadPicture = async (file: File) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      // Validate image
      const validation = validateImage(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      // Upload to storage
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      showToast({
        type: 'success',
        message: 'Profile picture updated successfully'
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload picture';
      setError(message);
      showToast({
        type: 'error',
        message
      });
    } finally {
      setLoading(false);
    }
  };

  return { uploadPicture, loading, error };
}