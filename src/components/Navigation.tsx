import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Music, User, Shield, Plus } from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';
import { Button } from './ui/button';
import { ReleaseFormModal } from './admin/ReleaseFormModal';

export function Navigation() {
  const { isAdmin, canManageReleases } = usePermissions();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) => `
    flex items-center gap-2 px-4 py-2 text-sm
    ${isActive 
      ? 'text-white bg-white/10' 
      : 'text-white/60 hover:text-white hover:bg-white/5'
    }
    rounded-md transition-all duration-200
  `;

  return (
    <div className="flex items-center justify-between w-full">
      <nav className="flex gap-2">
        <NavLink to="/" className={linkClass} end>
          <Music className="w-4 h-4" />
          Releases
        </NavLink>
        <NavLink to="/profile" className={linkClass}>
          <User className="w-4 h-4" />
          Profile
        </NavLink>
        {isAdmin && (
          <NavLink to="/admin/users" className={linkClass}>
            <Shield className="w-4 h-4" />
            Admin
          </NavLink>
        )}
      </nav>

      {canManageReleases && (
        <>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Release
          </Button>

          <ReleaseFormModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={() => setIsCreateModalOpen(false)}
          />
        </>
      )}
    </div>
  );
}