import React from 'react';
import { Pencil } from 'lucide-react';
import { DeleteReleaseButton } from './DeleteReleaseButton';

interface ReleaseActionsProps {
  releaseId: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function ReleaseActions({ releaseId, onEdit, onDelete }: ReleaseActionsProps) {
  return (
    <div className="flex gap-4">
      <button
        onClick={onEdit}
        className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
      >
        <Pencil className="w-4 h-4" />
        Edit
      </button>
      <DeleteReleaseButton releaseId={releaseId} onSuccess={onDelete} />
    </div>
  );
}