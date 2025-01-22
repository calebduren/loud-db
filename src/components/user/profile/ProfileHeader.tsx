import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { Profile } from "../../../types/database";
import { formatDate } from "../../../lib/utils/dateUtils";
import { useProfilePicture } from "../../../hooks/settings/useProfilePicture";
import { useToast } from "../../../hooks/useToast";
import { Button } from "../../../components/ui/button";
import { AvatarUpload } from "./AvatarUpload";
import { AuthContext } from "../../../contexts/AuthContext";

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
  const auth = useContext(AuthContext);
  const isOwnProfile = auth?.user?.id === profile.id;
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
          <AvatarUpload
            avatarUrl={profile.avatar_url}
            username={profile.username}
            size={80}
            loading={loading}
            preview={preview}
            onUpload={handleUpload}
            isEditable={isOwnProfile}
          />
        </div>
        {isOwnProfile && (
          <Link to="/account">
            <Button variant="secondary" size="lg">
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
            <span className="inline-flex items-center rounded-md bg-green-400/20 px-2 py-1 text-xs font-semibold text-green-400">
              Admin
            </span>
          )}
          {profile.role === "creator" && (
            <span className="inline-flex items-center rounded-md bg-purple-400/20 px-2 py-1 text-xs font-semibold text-purple-400">
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
