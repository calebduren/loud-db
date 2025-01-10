import React from "react";
import { Upload, Loader2 } from "lucide-react";
import { PixelAvatar } from "./PixelAvatar";

interface AvatarUploadProps {
  avatarUrl?: string | null;
  username: string;
  size?: number;
  loading?: boolean;
  preview?: string | null;
  onUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isEditable?: boolean;
}

export function AvatarUpload({
  avatarUrl,
  username,
  size = 80,
  loading,
  preview,
  onUpload,
  isEditable = false,
}: AvatarUploadProps) {
  if (!isEditable) {
    return (
      <div className="w-full h-full rounded-full overflow-hidden">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={username}
            className="w-full h-full object-cover"
          />
        ) : (
          <PixelAvatar seed={username} size={size} />
        )}
      </div>
    );
  }

  return (
    <label className="cursor-pointer block w-full h-full">
      <input
        type="file"
        accept="image/*"
        onChange={onUpload}
        disabled={loading}
        className="hidden"
      />
      <div className="relative w-full h-full rounded-full overflow-hidden group">
        {preview || avatarUrl ? (
          <img
            src={preview ?? avatarUrl ?? undefined}
            alt={username}
            className="w-full h-full object-cover"
          />
        ) : (
          <PixelAvatar seed={username} size={size} />
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <Upload size={16} strokeWidth={2} className="text-white" />
        </div>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </div>
    </label>
  );
}
