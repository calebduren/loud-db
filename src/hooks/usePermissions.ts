import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import { useCallback, useRef, useEffect } from 'react';

export function usePermissions() {
  const { user } = useAuth();
  const { profile, loading } = useProfile(user?.id);
  
  // Cache previous permissions
  const prevPermissionsRef = useRef({
    canManageReleases: false,
    isAdmin: false
  });

  // Update permissions cache when profile changes
  useEffect(() => {
    if (!loading && profile) {
      prevPermissionsRef.current = {
        canManageReleases: profile.role === 'admin' || profile.role === 'creator',
        isAdmin: profile.role === 'admin'
      };
    }
  }, [profile, loading]);

  // Use cached permissions if still loading
  const canManageReleases = loading 
    ? prevPermissionsRef.current.canManageReleases 
    : (profile?.role === 'admin' || profile?.role === 'creator');
    
  const isAdmin = loading 
    ? prevPermissionsRef.current.isAdmin 
    : profile?.role === 'admin';

  return {
    canManageReleases,
    isAdmin,
    loading,
    profile
  };
}