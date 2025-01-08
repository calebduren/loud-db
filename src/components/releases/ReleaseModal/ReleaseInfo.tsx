import React from "react";
import { Release } from "../../../types/database";
import { formatDate } from "../../../lib/utils/dateUtils";
import { Link } from "react-router-dom";

interface ReleaseInfoProps {
  release: Release;
  canEdit: boolean;
}

export function ReleaseInfo({ release, canEdit }: ReleaseInfoProps) {
  return (
    <div className="space-y-6">
      {/* Release Info Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="monospace text-sm text-white/60">Release Date</h3>
          <p>{formatDate(release.release_date)}</p>
        </div>
        <div>
          <h3 className="monospace text-sm text-white/60">Type</h3>
          <p>{release.release_type.toUpperCase()}</p>
        </div>
        <div>
          <h3 className="monospace text-sm text-white/60">Tracks</h3>
          <p>{release.track_count}</p>
        </div>
        {release.record_label && (
          <div>
            <h3 className="monospace text-sm text-white/60">Label</h3>
            <p>{release.record_label}</p>
          </div>
        )}
      </div>

      {/* Genres */}
      {release.genres.length > 0 && (
        <div>
          <h3 className="monospace text-sm text-white/60 mb-2">Genres</h3>
          <div className="flex flex-wrap gap-2">
            {release.genres.map((genre) => (
              <div key={genre} className="release-card__genres-pill">
                {genre}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {release.description && (
        <div className="mt-6 space-y-2">
          <h3 className="monospace text-sm text-white/60">Description</h3>
          <div className="bg-white/5 p-4 rounded-lg">
            <p className="text-white/80 whitespace-pre-wrap">
              {release.description}
            </p>
            {release.description_author && (
              <div className="mt-2 text-sm text-white/60">
                Written by{" "}
                <Link
                  to={`/user/${release.description_author.username}`}
                  className="text-white hover:underline"
                >
                  @{release.description_author.username}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
