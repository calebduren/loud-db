import React, { useState } from "react";
import { useUserReleases } from "../../hooks/useUserReleases";
import { ReleaseList } from "../releases/ReleaseList";
import { useAuth } from "../../hooks/useAuth";
import { LoadingSpinner } from "../LoadingSpinner";
import { ReleaseFormModal } from "../admin/ReleaseFormModal";
import { usePermissions } from "../../hooks/usePermissions";
import { Release } from "../../types/database";
import { AlertCircle } from "lucide-react";

export function CreatedReleases() {
  const { user } = useAuth();
  const { canManageReleases } = usePermissions();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);
  const { releases, loading, error, refetch } = useUserReleases(user?.id);

  if (!canManageReleases) {
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
        <h1 className="text-3xl font-bold text-white">Releases you created</h1>
      </div>

      {releases.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-white/60 mb-4">
            You haven't created any releases yet.
          </p>
        </div>
      ) : (
        <ReleaseList
          releases={releases}
          showActions
          onEdit={setEditingRelease}
          onDelete={refetch}
        />
      )}

      <ReleaseFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          refetch();
        }}
      />

      {editingRelease && (
        <ReleaseFormModal
          isOpen={true}
          onClose={() => setEditingRelease(null)}
          release={editingRelease}
          onSuccess={() => {
            setEditingRelease(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
