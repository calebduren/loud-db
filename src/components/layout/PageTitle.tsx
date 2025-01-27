import React from "react";
import { Button } from "../ui/button";
import { usePermissions } from "../../hooks/usePermissions";
import { ReleaseFormModal } from "../admin/ReleaseFormModal";
import { PlaylistImportModal } from "../admin/PlaylistImportModal";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { importFromReddit, ImportProgress } from "../../api/reddit";

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
  const [isImporting, setIsImporting] = React.useState(false);

  const canShowAddRelease = showAddRelease && (isAdmin || canManageReleases);
  const canShowImportPlaylist = showImportPlaylist && isAdmin;

  const handleRedditImport = async () => {
    try {
      setIsImporting(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("You must be logged in to import albums");
        return;
      }

      const result: ImportProgress = await importFromReddit(session.user.id);

      if (result) {
        const successCount = result.created.length;
        const failCount = result.errors.length;
        const skippedCount = result.skipped.length;
        
        if (successCount > 0) {
          toast.success(
            `Successfully imported ${successCount} albums${
              failCount > 0 ? ` (${failCount} failed, ${skippedCount} skipped)` : ""
            }`
          );
        } else {
          toast.error("No new albums were imported");
        }
      } else {
        toast.error("Import failed: Could not complete the import process");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to import from Reddit: ${errorMessage}`);
      console.error("Reddit import error:", error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between mb-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        {subtitle && (
          <p className="text-sm text-[--color-gray-400] font-medium">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 order-first sm:order-last">
        {actions}
        {canShowImportPlaylist && (
          <>
            <Button
              variant="secondary"
              onClick={() => setIsPlaylistModalOpen(true)}
            >
              Import Playlist
            </Button>
            <Button
              variant="secondary"
              onClick={handleRedditImport}
              disabled={isImporting}
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                "Scrape Reddit"
              )}
            </Button>
            <PlaylistImportModal
              isOpen={isPlaylistModalOpen}
              onClose={() => setIsPlaylistModalOpen(false)}
              onSuccess={() => setIsPlaylistModalOpen(false)}
            />
          </>
        )}
        {canShowAddRelease && (
          <>
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Add Release
            </Button>
            <ReleaseFormModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
            />
          </>
        )}
      </div>
    </div>
  );
};
