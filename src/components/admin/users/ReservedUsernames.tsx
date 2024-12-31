import React, { useState } from 'react';
import { useReservedUsernames } from '../../../hooks/admin/useReservedUsernames';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { AlertCircle, Plus, Loader2, X } from 'lucide-react';

export function ReservedUsernames() {
  const { usernames, loading, error, addUsername, removeUsername } = useReservedUsernames();
  const [newUsername, setNewUsername] = useState('');

  const handleAdd = async () => {
    if (!newUsername.trim()) return;
    await addUsername(newUsername.trim());
    setNewUsername('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Reserved Usernames</h3>
        <div className="flex items-center gap-2">
          <Input
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Add username"
            className="w-48"
          />
          <Button onClick={handleAdd} disabled={loading || !newUsername.trim()}>
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="space-y-2">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-white/40" />
          </div>
        ) : usernames.length === 0 ? (
          <p className="text-white/60">No reserved usernames.</p>
        ) : (
          usernames.map((item) => (
            <div
              key={item.username}
              className="flex items-center justify-between bg-white/5 p-3 rounded-lg"
            >
              <div>
                <code className="text-sm">{item.username}</code>
                <p className="text-sm text-white/60">{item.reason}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeUsername(item.username)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}