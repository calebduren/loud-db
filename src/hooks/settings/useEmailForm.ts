import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../useAuth';
import * as z from 'zod';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

export function useEmailForm() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.auth.updateUser({ 
        email: values.email.trim()
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError('Failed to update email');
    } finally {
      setSaving(false);
    }
  };

  return {
    email,
    setEmail,
    handleSubmit,
    saving,
    error,
    success
  };
}