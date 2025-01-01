import React from 'react';
import { NavLink } from 'react-router-dom';
import { Heart, Plus, Settings, Sliders } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';

export function ProfileNav() {
  const { canManageReleases } = usePermissions();

  const linkClass = ({ isActive }: { isActive: boolean }) => `
    flex items-center gap-3 px-4 py-3 text-sm w-full
    ${isActive 
      ? 'text-white bg-white/10' 
      : 'text-white/60 hover:text-white hover:bg-white/5'
    }
    rounded-md transition-all duration-200
  `;

  return (
    <nav className="flex flex-col gap-1 w-full">
      <NavLink to="/profile/likes" className={linkClass}>
        <Heart className="w-4 h-4" />
        Likes
      </NavLink>
      {canManageReleases && (
        <NavLink to="/profile/created" className={linkClass}>
          <Plus className="w-4 h-4" />
          Created
        </NavLink>
      )}
      <NavLink to="/profile/preferences" className={linkClass}>
        <Sliders className="w-4 h-4" />
        Preferences
      </NavLink>
      <NavLink to="/profile/account" className={linkClass}>
        <Settings className="w-4 h-4" />
        Account
      </NavLink>
    </nav>
  );
}