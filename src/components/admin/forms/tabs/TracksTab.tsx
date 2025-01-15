import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../releaseFormSchema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { formatDuration } from "@/lib/utils/formatters";

interface TracksTabProps {
  form: UseFormReturn<FormValues>;
}

export function TracksTab({ form }: TracksTabProps) {
  const tracks = form.watch("tracks") || [];

  const addTrack = () => {
    const currentTracks = form.getValues("tracks") || [];
    form.setValue("tracks", [
      ...currentTracks,
      {
        name: "",
        track_number: currentTracks.length + 1,
        duration_ms: 0,
      },
    ]);
  };

  const removeTrack = (index: number) => {
    const currentTracks = form.getValues("tracks") || [];
    form.setValue(
      "tracks",
      currentTracks
        .filter((_, i) => i !== index)
        .map((track, i) => ({ ...track, track_number: i + 1 }))
    );
  };

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="track_count"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Track Count</FormLabel>
            <FormControl>
              <Input type="number" min="0" placeholder="0" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <FormLabel>Tracks</FormLabel>
          <button
            type="button"
            onClick={addTrack}
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add Track
          </button>
        </div>

        {tracks.map((track, index) => (
          <div key={index} className="flex gap-4 items-start">
            <div className="w-12 text-center py-2 text-sm text-white/60">
              {index + 1}
            </div>

            <div className="flex-1 space-y-2">
              <Input
                value={track.name}
                onChange={(e) => {
                  const newTracks = [...tracks];
                  newTracks[index] = { ...track, name: e.target.value };
                  form.setValue("tracks", newTracks);
                }}
                placeholder="Track name"
              />

              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="999"
                    value={
                      track.duration_ms
                        ? Math.floor(track.duration_ms / 1000 / 60)
                        : ""
                    }
                    onChange={(e) => {
                      const minutes = parseInt(e.target.value) || 0;
                      const seconds = track.duration_ms
                        ? Math.floor((track.duration_ms / 1000) % 60)
                        : 0;
                      const newTracks = [...tracks];
                      newTracks[index] = {
                        ...track,
                        duration_ms: (minutes * 60 + seconds) * 1000,
                      };
                      form.setValue("tracks", newTracks);
                    }}
                    placeholder="Min"
                    className="w-20"
                  />
                  <span className="text-white/60">:</span>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={
                      track.duration_ms
                        ? Math.floor((track.duration_ms / 1000) % 60)
                        : ""
                    }
                    onChange={(e) => {
                      let seconds = parseInt(e.target.value) || 0;
                      let minutes = track.duration_ms
                        ? Math.floor(track.duration_ms / 1000 / 60)
                        : 0;

                      // Convert total seconds to minutes and seconds
                      if (seconds >= 60) {
                        minutes += Math.floor(seconds / 60);
                        seconds = seconds % 60;
                      }

                      const newTracks = [...tracks];
                      newTracks[index] = {
                        ...track,
                        duration_ms: (minutes * 60 + seconds) * 1000,
                      };
                      form.setValue("tracks", newTracks);
                    }}
                    placeholder="Sec"
                    className="w-20"
                  />
                </div>
                {track.duration_ms > 0 && (
                  <div className="text-sm text-white/60 py-2">
                    {formatDuration(track.duration_ms)}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Input
                  value={track.preview_url || ""}
                  onChange={(e) => {
                    const newTracks = [...tracks];
                    newTracks[index] = {
                      ...track,
                      preview_url: e.target.value,
                    };
                    form.setValue("tracks", newTracks);
                  }}
                  placeholder="Preview URL (optional)"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <FormLabel className="text-sm">Credits</FormLabel>
                  <button
                    type="button"
                    onClick={() => {
                      const newTracks = [...tracks];
                      const credits = newTracks[index].credits || [];
                      newTracks[index] = {
                        ...track,
                        credits: [...credits, { name: "", role: "" }],
                      };
                      form.setValue("tracks", newTracks);
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Credit
                  </button>
                </div>

                {track.credits?.map((credit, creditIndex) => (
                  <div key={creditIndex} className="flex gap-2 items-start">
                    <Input
                      value={credit.name}
                      onChange={(e) => {
                        const newTracks = [...tracks];
                        const credits = [...(newTracks[index].credits || [])];
                        credits[creditIndex] = {
                          ...credit,
                          name: e.target.value,
                        };
                        newTracks[index] = { ...track, credits };
                        form.setValue("tracks", newTracks);
                      }}
                      placeholder="Name"
                      className="flex-1"
                    />
                    <Input
                      value={credit.role}
                      onChange={(e) => {
                        const newTracks = [...tracks];
                        const credits = [...(newTracks[index].credits || [])];
                        credits[creditIndex] = {
                          ...credit,
                          role: e.target.value,
                        };
                        newTracks[index] = { ...track, credits };
                        form.setValue("tracks", newTracks);
                      }}
                      placeholder="Role"
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newTracks = [...tracks];
                        const credits = [...(newTracks[index].credits || [])];
                        credits.splice(creditIndex, 1);
                        newTracks[index] = { ...track, credits };
                        form.setValue("tracks", newTracks);
                      }}
                      className="p-2 text-white/60 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeTrack(index)}
              className="p-2 text-white/60 hover:text-white"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
