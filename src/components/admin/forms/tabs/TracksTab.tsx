import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Plus } from "lucide-react";
import { FormValues } from "../releaseFormSchema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils/formatters";
import { X } from "lucide-react";
import { Tooltip } from "../../../ui/tooltip";

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
        credits: [],
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
            <FormLabel>Track count</FormLabel>
            <FormControl>
              <Input type="number" min="0" placeholder="0" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-2">
        <div className="flex justify-between">
          <FormLabel>Tracks</FormLabel>
          <Button type="button" variant="link" size="link" onClick={addTrack}>
            <Plus size={14} strokeWidth={1.5} /> Add Track
          </Button>
        </div>

        {tracks.map((track, index) => (
          <div
            key={index}
            className="flex gap-4 items-start p-4 border-[0.5px] border-[--color-gray-600] rounded-lg"
          >
            <div className="w-8 text-center py-3 text-sm text-white/60">
              {index + 1}
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex gap-4">
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
              </div>

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

              <div className="space-y-3">
                {track.credits?.map((credit, creditIndex) => (
                  <div key={creditIndex} className="flex gap-4 items-start">
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
                      placeholder="Name for credit"
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
                    <Tooltip position="top" align="center" text="Delete credit">
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        onClick={() => {
                          const newTracks = [...tracks];
                          const credits = [...(newTracks[index].credits || [])];
                          credits.splice(creditIndex, 1);
                          newTracks[index] = { ...track, credits };
                          form.setValue("tracks", newTracks);
                        }}
                      >
                        <X size={14} strokeWidth={2} />
                      </Button>
                    </Tooltip>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="link"
                  size="link"
                  onClick={() => {
                    const newTracks = [...tracks];
                    const credits = newTracks[index].credits || [];
                    newTracks[index] = {
                      ...track,
                      credits: [...credits, { name: "", role: "" }],
                    };
                    form.setValue("tracks", newTracks);
                  }}
                >
                  <Plus size={14} strokeWidth={1.5} /> Add Credit
                </Button>
              </div>
            </div>
            <Tooltip position="top" align="center" text="Delete track">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() => removeTrack(index)}
              >
                <X size={14} strokeWidth={2} />
              </Button>
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  );
}
