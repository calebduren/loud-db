import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { usePermissions } from '../../hooks/usePermissions';

interface CreateReleaseButtonProps {
  onClick: () => void;
}

export function CreateReleaseButton({ onClick }: CreateReleaseButtonProps) {
  const { canManageReleases } = usePermissions();

  if (!canManageReleases) return null;

  return (
    <Button
      onClick={onClick}
      className="flex items-center gap-2"
    >
      <Plus className="w-4 h-4" />
      Add Release
    </Button>
  );
}