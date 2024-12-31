import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export function usePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      
      if (error) throw error;
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError('Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return {
    currentPassword,
    newPassword,
    setCurrentPassword,
    setNewPassword,
    handleSubmit,
    saving,
    error,
    success
  };
}