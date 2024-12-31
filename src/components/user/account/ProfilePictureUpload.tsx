import React, { useState } from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import { useProfilePicture } from '../../../hooks/settings/useProfilePicture';
import { validateImage } from '../../../lib/validation/imageValidation';
import { MAX_IMAGE_SIZE_MB } from '../../../lib/constants';

export function ProfilePictureUpload() {
  const [preview, setPreview] = useState<string | null>(null);
  const { uploadPicture, loading, error } = useProfilePicture();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate image before uploading
    const validation = validateImage(file);
    if (!validation.valid) {
      event.target.value = ''; // Clear the input
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
    <div className="space-y-4">
      {preview ? (
        <div className="relative">
          <div className="relative w-32 h-32 rounded-full overflow-hidden bg-white/5">
            <img
              src={preview}
              alt="Profile preview"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={clearImage}
            className="absolute top-0 right-0 p-1 bg-black/50 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="cursor-pointer block">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={loading}
            className="hidden"
          />
          <div className="w-32 h-32 border-2 border-dashed border-white/10 rounded-full flex flex-col items-center justify-center gap-2 bg-white/5 hover:bg-white/10 transition-colors">
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 text-white/60 animate-spin" />
                <span className="text-sm text-white/60">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 text-white/60" />
                <span className="text-sm text-white/60">Upload Photo</span>
                <span className="text-xs text-white/40">Max {MAX_IMAGE_SIZE_MB}MB</span>
              </>
            )}
          </div>
        </label>
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}