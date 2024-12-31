import React from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { useDeleteRelease } from '../../hooks/useDeleteRelease';

interface DeleteReleaseButtonProps {
  releaseId: string;
  onSuccess: () => void;
}

export function DeleteReleaseButton({ releaseId, onSuccess }: DeleteReleaseButtonProps) {
  const { deleteRelease, deleting } = useDeleteRelease();

  const handleDelete = async () => {
    const success = await deleteRelease(releaseId);
    if (success) onSuccess();
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-red-500 hover:text-red-600 flex items-center gap-1"
    >
      {deleting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
      Delete
    </button>
  );
}