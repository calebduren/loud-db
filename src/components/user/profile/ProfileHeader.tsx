import React, { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Profile } from "../../../types/database";
import { formatDate } from "../../../lib/utils/dateUtils";
import { useAuth } from "../../../hooks/useAuth";
import { useProfilePicture } from "../../../hooks/settings/useProfilePicture";
import { useToast } from "../../../hooks/useToast";
import { PixelAvatar } from "./PixelAvatar";
import { Button } from "../../../components/ui/button";

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

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const url = URL.createObjectURL(file);
      setPreview(url);
      await uploadPicture(file);
    } catch (error) {
      showToast({
        message: "Error uploading picture",
        type: "error",
      });
      setPreview(null);
    }
  };

  return (
    <div className="flex flex-col items-start mb-8">
      <div className="flex flex-row w-full items-center justify-between">
        <div className="relative w-20 h-20">
          {isOwnProfile ? (
            <label className="cursor-pointer block w-full h-full">
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={loading}
                className="hidden"
              />
              <div className="relative w-full h-full rounded-full overflow-hidden group">
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
                  <PixelAvatar seed={profile.username} size={80} />
                )}
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>
            </label>
          ) : (
            <div className="w-full h-full rounded-full overflow-hidden">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <PixelAvatar seed={profile.username} size={80} />
              )}
            </div>
          )}
        </div>
        {isOwnProfile && (
          <Link to="/account">
            <Button variant="secondary" size="sm" className="mt-4">
              Edit Profile
            </Button>
          </Link>
        )}
      </div>

      <div className="mt-4">
        <h1 className="text-2xl font-semibold">@{profile.username}</h1>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-white/60">
            Joined {formatDate(profile.created_at)}
          </p>
          {profile.role === "admin" && (
            <span className="inline-flex items-center rounded-md bg-purple-400/10 px-2 py-1 text-xs font-medium text-purple-400">
              Admin
            </span>
          )}
          {profile.role === "creator" && (
            <span className="inline-flex items-center rounded-md bg-blue-400/10 px-2 py-1 text-xs font-medium text-blue-400">
              Creator
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-4 mt-4 w-full">
        <div className="bg-white/5 rounded-lg px-3 py-3 w-40">
          <div className="text-2xl font-bold">{likesCount}</div>
          <div className="text-sm text-white/60">Likes</div>
        </div>
        {(profile.role === "admin" || profile.role === "creator") && (
          <div className="rounded-lg px-3 py-3 w-40">
            <div className="text-2xl font-bold">{releasesCount}</div>
            <div className="text-sm text-white/60">Submissions</div>
          </div>
        )}
      </div>
    </div>
  );
}
