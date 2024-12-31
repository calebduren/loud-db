import React, { useState } from 'react';
import { Ticket, Plus, Loader2 } from 'lucide-react';
import { useInviteCodes } from '../../../hooks/admin/useInviteCodes';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';

export function InviteCodeManager() {
  const { codes, loading, createCode, error } = useInviteCodes();
  const [expiryDays, setExpiryDays] = useState('30');

  const handleCreate = async () => {
    const days = parseInt(expiryDays);
    if (isNaN(days) || days < 1) return;
    await createCode(days);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Ticket className="w-6 h-6" />
          Invite Codes
        </h2>
        <div className="flex items-center gap-4">
          <Input
            type="number"
            min="1"
            value={expiryDays}
            onChange={(e) => setExpiryDays(e.target.value)}
            className="w-24"
            placeholder="Days"
          />
          <Button onClick={handleCreate} disabled={loading}>
            <Plus className="w-4 h-4 mr-2" />
            Generate Code
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-white/40" />
          </div>
        ) : codes.length === 0 ? (
          <p className="text-white/60">No invite codes generated yet.</p>
        ) : (
          <div className="grid gap-4">
            {codes.map((code) => (
              <div
                key={code.id}
                className="bg-white/5 p-4 rounded-lg flex items-center justify-between"
              >
                <div>
                  <code className="text-lg font-mono">{code.code}</code>
                  <div className="text-sm text-white/60">
                    {code.used_by ? (
                      <>Used on {new Date(code.used_at!).toLocaleDateString()}</>
                    ) : code.expires_at ? (
                      <>Expires on {new Date(code.expires_at).toLocaleDateString()}</>
                    ) : (
                      'Never expires'
                    )}
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${
                  code.used_by 
                    ? 'bg-gray-500/10 text-gray-400'
                    : 'bg-green-500/10 text-green-500'
                }`}>
                  {code.used_by ? 'Used' : 'Available'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}