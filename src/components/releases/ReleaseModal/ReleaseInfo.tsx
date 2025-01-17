import React from "react";
import { Release } from "../../../types/database";
import { formatDate } from "../../../lib/utils/dateUtils";
import { Link } from "react-router-dom";

interface ReleaseInfoProps {
  release: Release;
}

export function ReleaseInfo({ release }: ReleaseInfoProps) {
  return (
    <div className="space-y-6">
      {/* Release Info Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="release-card__label">Release Date</h3>
          <p className="text-sm">{formatDate(release.release_date)}</p>
        </div>
        <div>
          <h3 className="release-card__label">Type</h3>
          <p className="text-sm">
            {release.release_type.charAt(0).toUpperCase() +
              release.release_type.slice(1).toLowerCase()}
          </p>{" "}
        </div>
        <div>
          <h3 className="release-card__label">Tracks</h3>
          <p className="text-sm">{release.track_count}</p>
        </div>
        {release.record_label && (
          <div>
            <h3 className="release-card__label">Label</h3>
            <p className="text-sm">{release.record_label}</p>
          </div>
        )}
      </div>

      {/* Genres */}
      {release.genres.length > 0 && (
        <div>
          <h3 className="release-card__label">Genres</h3>
          <div className="flex flex-wrap gap-2 mt-2">
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
          <h3 className="release-card__label">Description</h3>
          <p className="text-sm whitespace-pre-wrap">{release.description}</p>
          {release.description_author && (
            <div className="mt-2 text-xs font-medium text-[--color-gray-400]">
              Written by{" "}
              <Link
                to={`/u/${release.description_author.username}`}
                className="text-white font-semibold hover:underline"
              >
                @{release.description_author.username}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
