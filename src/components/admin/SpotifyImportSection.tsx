import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle } from "lucide-react";
import { fetchReleaseFromSpotify } from "../../lib/spotify/client";
import { SpotifyReleaseData } from "../../lib/spotify/types";
import { validateSpotifyUrl } from "../../lib/spotify/validation";
import { Progress } from "../../components/ui/progress";
import { toast } from "sonner";
import { FormInput } from "../ui/form-input";

interface SpotifyImportSectionProps {
  onImport: (data: SpotifyReleaseData) => Promise<void>;
  disabled?: boolean;
}

export function SpotifyImportSection({
  onImport,
  disabled,
}: SpotifyImportSectionProps) {
  const [url, setUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importStage, setImportStage] = useState<
    "spotify" | "apple_music" | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    setError(null);

    // Validate URL format
    const validation = validateSpotifyUrl(url);
    if (!validation.isValid) {
      setError(validation.error ?? null);
      toast.error(validation.error ?? "Invalid URL", {
        position: "top-center",
      });
      return;
    }

    setImporting(true);
    setImportStage("spotify");

    try {
      const release = await fetchReleaseFromSpotify(url);
      setImportStage("apple_music");
      await onImport(release);
      setUrl("");
      // We'll let ReleaseForm handle the success toast
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to import release";
      setError(message);
      toast.error(message, {
        position: "top-center",
      });
    } finally {
      setImporting(false);
      setImportStage(null);
    }
  };

  const getImportProgress = () => {
    if (!importing) return 0;
    if (importStage === "spotify") return 50;
    if (importStage === "apple_music") return 75;
    return 100;
  };

  const getImportStatus = () => {
    if (!importing) return "";
    if (importStage === "spotify") return "Fetching Spotify data...";
    if (importStage === "apple_music") return "Finding Apple Music link...";
    return "Importing...";
  };

  return (
    <div className="space-y-4 mb-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <FormInput
            id="spotify-url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste Spotify album URL"
            disabled={disabled || importing}
            label="Import from Spotify"
          />
        </div>
        <Button
          onClick={handleImport}
          disabled={disabled || importing || !url}
          className="h-10 whitespace-nowrap"
        >
          {importing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span>Importing...</span>
            </>
          ) : (
            <>
              <span>Import</span>
            </>
          )}
        </Button>
      </div>

      {importing && (
        <div className="space-y-2 mt-4">
          <div className="relative">
            <Progress value={getImportProgress()} className="h-2" />
            <p className="text-sm font-medium text-[--color-gray-400] mt-1">
              {getImportStatus()}
            </p>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
