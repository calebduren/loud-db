import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useUserReleases } from "../../hooks/useUserReleases";
import { ReleaseList } from "../releases/ReleaseList";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import { LoadingSpinner } from "../LoadingSpinner";
import { ReleaseFormModal } from "../admin/ReleaseFormModal";
import { usePermissions } from "../../hooks/usePermissions";
import { Release } from "../../types/database";
import { AlertCircle, Plus } from "lucide-react";

export function CreatedReleases() {
  const { username } = useParams();
  const { user } = useAuth();
  const { profile } = useProfile(username);
  const { canManageReleases } = usePermissions();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);
  
  const isOwnProfile = !username || user?.username === username;
  const userId = isOwnProfile ? user?.id : profile?.id;
  const { releases, loading, error, refetch } = useUserReleases(userId);

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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">
          {isOwnProfile ? "Releases you created" : `Releases by ${profile?.username}`}
        </h1>
        {isOwnProfile && canManageReleases && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Release
          </button>
        )}
      </div>

      {releases.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-white/60">No releases found.</p>
        </div>
      ) : (
        <ReleaseList releases={releases} onEdit={isOwnProfile ? setEditingRelease : undefined} />
      )}

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
