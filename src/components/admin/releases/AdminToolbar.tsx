import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../ui/button';

interface AdminToolbarProps {
  onCreateClick: () => void;
}

export function AdminToolbar({ onCreateClick }: AdminToolbarProps) {
  return (
    <div className="flex gap-4">
      <Button
        onClick={onCreateClick}
        className="flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Release
      </Button>
    </div>
  );
}