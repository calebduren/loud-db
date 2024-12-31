import React from 'react';
import { Trash2 } from 'lucide-react';
import { useDeleteAccount } from '../../../hooks/settings/useDeleteAccount';

export function DeleteAccount() {
  const { handleDelete, deleting, error } = useDeleteAccount();

  return (
    <div className="card border-red-500/20">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-red-500">
        <Trash2 className="w-5 h-5" />
        Delete Account
      </h2>

      <div className="space-y-6">
        <p className="text-white/60">
          This action cannot be undone. This will permanently delete your account and remove your data from our servers.
        </p>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-full bg-red-500 hover:bg-red-600 text-white h-10 px-4 rounded-md transition-colors disabled:opacity-50"
        >
          {deleting ? 'Deleting...' : 'Delete Account'}
        </button>
      </div>
    </div>
  );
}