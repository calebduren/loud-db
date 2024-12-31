import React, { useState } from 'react';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { AlertCircle } from 'lucide-react';

interface NewGroupFormProps {
  onSubmit: (name: string) => Promise<void>;
  error: string | null;
}

export function NewGroupForm({ onSubmit, error }: NewGroupFormProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onSubmit(name.trim());
      setName('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter group name (e.g., House, R&B)"
          disabled={loading}
        />
        {error && (
          <div className="mt-2 text-red-500 text-sm flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      <Button type="submit" disabled={loading || !name.trim()}>
        {loading ? 'Creating...' : 'Create Group'}
      </Button>
    </form>
  );
}