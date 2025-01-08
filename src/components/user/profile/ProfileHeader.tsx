import React, { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Profile } from "../../../types/database";
import { formatDate } from "../../../lib/utils/dateUtils";
import { useAuth } from "../../../hooks/useAuth";
import { useProfilePicture } from "../../../hooks/settings/useProfilePicture";
import { validateImage } from "../../../lib/validation/imageValidation";
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

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate image before uploading
    const validation = validateImage(file);
    if (!validation.valid) {
      event.target.value = ""; // Clear the input
      return;
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Upload file
    await uploadPicture(file);
  };

  return (
    <>
      {isOwnProfile ? (
        <label className="cursor-pointer block">
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

      <h1 className="text-2xl font-semibold mt-8">@{profile.username}</h1>

      <p className="text-sm text-white/60 font-mono mt-1">
        Joined {formatDate(profile.created_at)}
      </p>

      <div className="flex gap-6 mt-8">
        <div>
          <p className="text-sm text-white/60 font-mono">Created</p>
          <p className="text-2xl font-bold">{releasesCount}</p>
        </div>

        <div>
          <p className="text-sm text-white/60 font-mono">Likes</p>
          <p className="text-2xl font-bold">{likesCount}</p>
        </div>
      </div>
    </>
  );
}
