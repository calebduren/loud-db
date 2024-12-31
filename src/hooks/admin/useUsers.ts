import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Profile, UserRole } from '../../types/database';
import { useToast } from '../useToast';
import { usePermissions } from '../usePermissions';

interface UserWithEmail extends Profile {
  email: string;
}

export function useUsers() {
  const [users, setUsers] = useState<UserWithEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { isAdmin } = usePermissions();

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Then get emails for each user using the secure function
      const usersWithEmails = await Promise.all(
        profiles.map(async (profile) => {
          const { data: email } = await supabase
            .rpc('get_user_email', { user_id: profile.id });

          return {
            ...profile,
            email: email || ''
          };
        })
      );

      setUsers(usersWithEmails);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast({
        type: 'error',
        message: 'Failed to load users'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
    try {
      const { error } = await supabase
        .rpc('update_user_role', { user_id: userId, new_role: role });

      if (error) throw error;

      await fetchUsers();
      showToast({
        type: 'success',
        message: 'User role updated successfully'
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      showToast({
        type: 'error',
        message: 'Failed to update user role'
      });
    }
  };

  const toggleSuspension = async (userId: string, suspend: boolean) => {
    try {
      const { error } = await supabase
        .rpc('toggle_user_suspension', { 
          user_id: userId, 
          should_suspend: suspend 
        });

      if (error) throw error;

      await fetchUsers();
      showToast({
        type: 'success',
        message: `User ${suspend ? 'suspended' : 'unsuspended'} successfully`
      });
    } catch (error) {
      console.error('Error toggling suspension:', error);
      showToast({
        type: 'error',
        message: 'Failed to update user status'
      });
    }
  };

  return {
    users,
    loading,
    updateUserRole,
    toggleSuspension
  };
}