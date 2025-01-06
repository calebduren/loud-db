import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import { ReleaseList } from "../releases/ReleaseList";
import { useUserReleases } from "../../hooks/useUserReleases";
import { PageHeader } from "../layout/PageHeader";
import { LoadingSpinner } from "../LoadingSpinner";
import { ReleaseFormModal } from "../admin/ReleaseFormModal";
import { usePermissions } from "../../hooks/usePermissions";
import { Release } from "../../types/database";
import { AlertCircle, Plus } from "lucide-react";

export function CreatedReleases() {
  const { username } = useParams();
  const { user } = useAuth();
  const { profile: currentProfile } = useProfile(user?.id);
  const { profile, loading: profileLoading } = useProfile(username);
  const { canManageReleases } = usePermissions();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);
  
  const isOwnProfile = !username || user?.username === username;
  const userId = isOwnProfile ? user?.id : profile?.id;
  const { releases, loading: releasesLoading, error, refetch } = useUserReleases(userId);
  const loading = profileLoading || releasesLoading;

  if (!canManageReleases && isOwnProfile) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center gap-2 text-red-500 bg-red-500/10 px-4 py-2 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <p>You don't have permission to access this page</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center gap-2 text-red-500 bg-red-500/10 px-4 py-2 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <p>{error.message}</p>
        </div>
    </div>
    );
  }

  const isAdmin = currentProfile?.role === "admin";
  const isCreator = currentProfile?.role === "creator";

  return (
    <div>
      <PageHeader 
        title={isOwnProfile ? "Releases you created" : `Releases by ${profile?.username}`} 
        showAddRelease={isAdmin || isCreator}
        showImportPlaylist={isAdmin}
      />
      <ReleaseList releases={releases || []} loading={loading} onEdit={isOwnProfile ? setEditingRelease : undefined} />

      {isCreateModalOpen && (
        <ReleaseFormModal
          onClose={() => {
            setIsCreateModalOpen(false);
            refetch();
          }}
        />
      )}

      {editingRelease && (
        <ReleaseFormModal
          release={editingRelease}
          onClose={() => {
            setEditingRelease(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
