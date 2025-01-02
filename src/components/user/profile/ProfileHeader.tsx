import React, { useState } from "react";
import { User, Upload, X, Loader2 } from "lucide-react";
import { Profile } from "../../../types/database";
import { formatDate } from "../../../lib/utils/dateUtils";
import { useAuth } from "../../../hooks/useAuth";
import { useProfilePicture } from "../../../hooks/settings/useProfilePicture";
import { validateImage } from "../../../lib/validation/imageValidation";
import { MAX_IMAGE_SIZE_MB } from "../../../lib/constants";

interface ProfileHeaderProps {
  profile: Profile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const { user } = useAuth();
  const isOwnProfile = user?.id === profile.id;
  const [preview, setPreview] = useState<string | null>(null);
  const { uploadPicture, loading, error } = useProfilePicture();

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

  const clearImage = () => {
    setPreview(null);
  };

  return (
    <div className="flex items-center gap-6 mb-8">
      <div className="relative w-24 h-24">
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
                <div className="w-full h-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <User className="w-12 h-12 text-white/40" />
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
                <User className="w-12 h-12 text-white/40" />
              </div>
            )}
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-1">{profile.username}</h1>
        <p className="text-white/60">
          Member since {formatDate(profile.created_at)}
        </p>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    </div>
  );
}
