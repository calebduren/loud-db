import React from 'react';
import { Track } from '../../../types/database';
import { formatDuration } from '../../../lib/utils/formatters';

interface TrackListProps {
  tracks: Track[];
}

export function TrackList({ tracks }: TrackListProps) {
  const sortedTracks = React.useMemo(() => {
    return [...tracks].sort((a, b) => a.track_number - b.track_number);
  }, [tracks]);

  if (!sortedTracks.length) return null;

  return (
    <div className="mt-6">
      <h3 className="text-sm text-white/60 mb-2">Track List</h3>
      <div className="space-y-2">
        {sortedTracks.map(track => (
          <div key={track.id} className="flex items-center gap-4">
            <span className="text-white/40 w-8 text-right">
              {track.track_number}
            </span>
            <span className="flex-1">{track.name}</span>
            {track.duration_ms > 0 && (
              <span className="text-white/40">
                {formatDuration(track.duration_ms)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}