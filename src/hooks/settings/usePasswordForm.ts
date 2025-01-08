import { useState } from 'react';
import { supabase } from '../../lib/supabase';

type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
};

export function usePasswordForm() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (data: PasswordFormData) => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.auth.updateUser({ 
        password: data.newPassword 
      });
      
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError('Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return { handleSubmit, saving, error, success };
}