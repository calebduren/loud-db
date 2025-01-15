import React, { useState, useEffect } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Button } from "../ui/button";

interface ImageUploadProps {
  value?: string;
  onUploadComplete: (url: string) => void;
}

export function ImageUpload({ value, onUploadComplete }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Set initial preview if value exists
  useEffect(() => {
    if (value) {
      setPreview(value);
    }
  }, [value]);

  // Listen for cover URL updates from Spotify import
  useEffect(() => {
    const handleCoverUrlUpdate = (event: CustomEvent<string>) => {
      setPreview(event.detail);
    };

    window.addEventListener(
      "coverUrlUpdate",
      handleCoverUrlUpdate as EventListener
    );
    return () => {
      window.removeEventListener(
        "coverUrlUpdate",
        handleCoverUrlUpdate as EventListener
      );
    };
  }, []);

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;

      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("covers")
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("covers").getPublicUrl(data.path);

      onUploadComplete(publicUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setPreview(null);
    onUploadComplete("");
  };

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative">
          <div className="relative aspect-square w-48 rounded-lg overflow-hidden bg-white/5">
            <img
              src={preview}
              alt="Cover preview"
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={clearImage}
            className="absolute top-2 right-2"
          >
            <X size={14} strokeWidth={2} />
          </Button>
        </div>
      ) : (
        <label className="relative cursor-pointer block">
          <input
            type="file"
            accept="image/*"
            onChange={uploadImage}
            disabled={uploading}
            className="hidden"
          />
          <div className="h-48 w-48 border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center gap-2 bg-white/5 hover:bg-white/10 transition-colors">
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
                <span className="text-sm text-white/60">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-white/60" />
                <span className="text-sm text-white/60">Upload Cover</span>
              </>
            )}
          </div>
        </label>
      )}
    </div>
  );
}
