import React from 'react';
import { AlertCircle } from 'lucide-react';
import { ReleaseValidationError } from '@/lib/errors/releaseErrors';

interface DuplicateReleaseErrorProps {
  error: ReleaseValidationError;
}

export function DuplicateReleaseError({ error }: DuplicateReleaseErrorProps) {
  return (
    <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">
      <div className="flex items-start gap-2">
        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <div className="font-medium mb-2">{error.message}</div>
          {error.details && (
            <ul className="space-y-1 text-sm">
              {error.details.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}