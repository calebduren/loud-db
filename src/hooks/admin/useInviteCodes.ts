import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../useToast';

interface InviteCode {
  id: string;
  code: string;
  created_at: string;
  used_by: string | null;
  used_at: string | null;
  expires_at: string | null;
}

export function useInviteCodes() {
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('invite_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCodes(data || []);
    } catch (err) {
      console.error('Error fetching invite codes:', err);
      setError('Failed to load invite codes');
    } finally {
      setLoading(false);
    }
  };

  const createCode = async (expiryDays: number) => {
    try {
      setLoading(true);
      const code = generateInviteCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiryDays);

      const { error: insertError } = await supabase
        .from('invite_codes')
        .insert({ 
          code,
          expires_at: expiresAt.toISOString()
        });

      if (insertError) throw insertError;

      showToast({
        type: 'success',
        message: 'Invite code generated successfully'
      });

      await fetchCodes();
    } catch (err) {
      console.error('Error creating invite code:', err);
      setError('Failed to create invite code');
      showToast({
        type: 'error',
        message: 'Failed to create invite code'
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    codes,
    loading,
    error,
    createCode
  };
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = 3;
  const segmentLength = 4;
  
  const segments_arr = [];
  for (let i = 0; i < segments; i++) {
    let segment = '';
    for (let j = 0; j < segmentLength; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments_arr.push(segment);
  }
  
  return segments_arr.join('-');
}