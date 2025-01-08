import React, { useState, useEffect } from 'react';
import { useProfile } from '../useProfile';
import { useAuth } from '../useAuth';
import * as z from 'zod';

const formSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
});

export function useProfileForm() {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile(user?.id);
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile?.username) {
      setUsername(profile.username);
    }
  }, [profile]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    const trimmedUsername = values.username.trim();

    try {
      const success = await updateProfile({ 
        username: trimmedUsername,
        updated_at: new Date().toISOString()
      });

      if (success) {
        setSuccess(true);
        setUsername(trimmedUsername);
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('profiles_username_unique')) {
          setError('Username is not available');
        } else {
          console.error('Profile update error:', err);
        }
      } else {
        setError('Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  return {
    username,
    setUsername,
    handleSubmit,
    saving,
    error,
    success
  };
}