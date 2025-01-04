import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Music, User, Shield, Plus, ListMusic } from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';
import { Button } from './ui/button';
import { ReleaseFormModal } from './admin/ReleaseFormModal';
import { PlaylistImportModal } from './admin/PlaylistImportModal';

export function Navigation() {
  const { isAdmin, canManageReleases } = usePermissions();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);

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
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setIsPlaylistModalOpen(true)}
              className="flex items-center gap-2"
            >
              <ListMusic className="w-4 h-4" />
              Import Playlist
            </Button>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Release
            </Button>
          </div>

          <ReleaseFormModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={() => {
              setIsCreateModalOpen(false);
              window.location.reload();
            }}
          />

          <PlaylistImportModal
            isOpen={isPlaylistModalOpen}
            onClose={() => setIsPlaylistModalOpen(false)}
            onSuccess={() => {
              setIsPlaylistModalOpen(false);
              window.location.reload();
            }}
          />
        </>
      )}
    </div>
  );
}