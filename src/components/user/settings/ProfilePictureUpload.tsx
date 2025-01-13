import React, { useState, useContext } from "react";
import { X } from "lucide-react";
import { useProfilePicture } from "../../../hooks/settings/useProfilePicture";
import { validateImage } from "../../../lib/validation/imageValidation";
import { MAX_IMAGE_SIZE_MB } from "../../../lib/constants";
import { AuthContext } from "../../../contexts/AuthContext";
import { useProfile } from "../../../hooks/useProfile";
import { AvatarUpload } from "../profile/AvatarUpload";

export function ProfilePictureUpload() {
  const [preview, setPreview] = useState<string | null>(null);
  const { uploadPicture, loading, error } = useProfilePicture();
  const { user } = useContext(AuthContext);
  const { profile } = useProfile(user?.id);

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

  if (!profile) return null;

  return (
    <div className="space-y-4">
      <div className="relative w-32">
        <div className="relative w-20 h-20">
          <AvatarUpload
            avatarUrl={profile.avatar_url}
            username={profile.username}
            size={80}
            loading={loading}
            preview={preview}
            onUpload={handleUpload}
            isEditable={true}
          />
        </div>
        {preview && (
          <button
            onClick={clearImage}
            className="absolute top-0 right-0 p-1 bg-black/50 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="text-xs text-white/80 font-medium">
        <p>Max {MAX_IMAGE_SIZE_MB}MB</p>
        <p>PNG, JPG/JPEG</p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
