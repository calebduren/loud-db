import React from "react";
import { Track } from "../../../types/database";
import { formatDuration } from "../../../lib/utils/formatters";

interface TrackListProps {
  tracks: Track[];
}

export function TrackList({ tracks }: TrackListProps) {
  const sortedTracks = React.useMemo(() => {
    return [...tracks].sort((a, b) => a.track_number - b.track_number);
  }, [tracks]);

  if (!sortedTracks.length) return null;

  return (
    <div className="mt-8">
      <h3 className="release-card__label">Track List</h3>
      <div className="space-y-3 mt-4">
        {sortedTracks.map((track) => (
          <div key={track.id} className="flex items-center gap-2">
            <span className="release-modal__track-number">
              {track.track_number}.
            </span>
            <span className="flex-1 text-sm">{track.name}</span>
            {track.duration_ms != null && track.duration_ms > 0 && (
              <span className="text-[--color-gray-400] font-mono text-sm">
                {formatDuration(track.duration_ms)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
