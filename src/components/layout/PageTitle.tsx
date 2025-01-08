import React from "react";
import { Button } from "../ui/button";
import { usePermissions } from "../../hooks/usePermissions";
import { ReleaseFormModal } from "../admin/ReleaseFormModal";
import { PlaylistImportModal } from "../admin/PlaylistImportModal";

interface PageTitleProps {
  title: string;
  subtitle?: string;
  showAddRelease?: boolean; // Will only show for admins and creators
  showImportPlaylist?: boolean; // Will only show for admins
  actions?: React.ReactNode;
}

export const PageTitle = ({
  title,
  subtitle,
  showAddRelease,
  showImportPlaylist,
  actions,
}: PageTitleProps) => {
  const { isAdmin, canManageReleases } = usePermissions();
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = React.useState(false);

  const canShowAddRelease = showAddRelease && (isAdmin || canManageReleases);
  const canShowImportPlaylist = showImportPlaylist && isAdmin;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && (
          <p className="text-sm text-white/60 mt-1 font-medium">{subtitle}</p>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 order-first sm:order-last">
        {actions}
        {canShowAddRelease && (
          <>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Add release
            </Button>
            <ReleaseFormModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSuccess={() => {
                setIsCreateModalOpen(false);
                window.location.reload();
              }}
            />
          </>
        )}
        {canShowImportPlaylist && (
          <>
            <Button
              variant="outline"
              onClick={() => setIsPlaylistModalOpen(true)}
            >
              Import playlist
            </Button>
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
    </div>
  );
};
