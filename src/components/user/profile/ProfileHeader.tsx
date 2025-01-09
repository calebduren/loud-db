import React, { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Profile } from "../../../types/database";
import { formatDate } from "../../../lib/utils/dateUtils";
import { useAuth } from "../../../hooks/useAuth";
import { useProfilePicture } from "../../../hooks/settings/useProfilePicture";
import { validateImage } from "../../../lib/validation/imageValidation";
import { useToast } from "../../../hooks/useToast";
import { PixelAvatar } from "./PixelAvatar";

interface ProfileHeaderProps {
  profile: Profile;
  releasesCount: number;
  likesCount: number;
}

export function ProfileHeader({
  profile,
  releasesCount,
  likesCount,
}: ProfileHeaderProps) {
  const { user } = useAuth();
  const isOwnProfile = user?.id === profile.id;
  const [preview, setPreview] = useState<string | null>(null);
  const { uploadPicture, loading } = useProfilePicture();
  const { showToast } = useToast();
  const showCreated = profile.role === "admin" || profile.role === "creator";

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await validateImage(file);
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      await uploadPicture(file);
    } catch (error) {
      showToast({
        message:
          error instanceof Error ? error.message : "Failed to upload image",
        type: "error",
      });
    }
  };

  return (
    <>
      {isOwnProfile ? (
        <label className="cursor-pointer inline-block rounded-full">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={loading}
            className="hidden"
          />
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-white/10 group hover:ring-2 hover:ring-white/20 transition-all">
            {preview || profile.avatar_url ? (
              <>
                <img
                  src={preview || profile.avatar_url}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Upload className="w-6 h-6 text-white" />
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <PixelAvatar seed={profile.username} size={96} />
              </div>
            )}
          </div>
        </label>
      ) : (
        <div className="w-24 h-24 rounded-full overflow-hidden bg-white/10">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PixelAvatar seed={profile.username} size={96} />
            </div>
          )}
        </div>
      )}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
      )}

      <div className="flex items-center justify-between mt-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">@{profile.username}</h1>
          {profile.role === "admin" && (
            <span className="inline-flex items-center rounded-md bg-purple-400/10 px-2 py-1 text-xs font-medium text-purple-400 ring-1 ring-inset ring-purple-400/30">
              Admin
            </span>
          )}
          {profile.role === "creator" && (
            <span className="inline-flex items-center rounded-md bg-blue-400/10 px-2 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-400/30">
              Creator
            </span>
          )}
        </div>
        {isOwnProfile && (
          <Link
            to="/account"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white/80 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-colors"
          >
            Edit Profile
          </Link>
        )}
      </div>

      <p className="text-sm font-semibold text-white/60 font-mono mt-1">
        Joined {formatDate(profile.created_at)}
      </p>

      <div className="flex gap-6 mt-8">
        <div>
          <p className="text-sm font-semibold text-white/60 font-mono">Likes</p>
          <p className="text-2xl font-bold">{likesCount}</p>
        </div>
        {showCreated && (
          <div>
            <p className="text-sm font-semibold text-white/60 font-mono">
              Submissions
            </p>
            <p className="text-2xl font-bold">{releasesCount}</p>
          </div>
        )}
      </div>
    </>
  );
}
