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
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "../../ImageUpload";
import { Plus, X } from "lucide-react";

interface BasicInfoTabProps {
  form: UseFormReturn<FormValues>;
  selectedArtists: { id?: string; name: string }[];
  artistOptions: { id: string; name: string }[];
  onArtistChange: (
    index: number,
    value: string,
    availableArtists: typeof artistOptions
  ) => void;
  onAddArtist: () => void;
  onRemoveArtist: (index: number) => void;
}

const RELEASE_TYPES = ["single", "EP", "LP", "compilation"] as const;

export function BasicInfoTab({
  form,
  selectedArtists,
  artistOptions,
  onArtistChange,
  onAddArtist,
  onRemoveArtist,
}: BasicInfoTabProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Release Name</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter release name" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="release_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Release Type</FormLabel>
            <FormControl>
              <select
                {...field}
                className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20"
                required
              >
                <option value="" className="bg-[var(--color-gray-800)]">
                  Select Type
                </option>
                {RELEASE_TYPES.map((type) => (
                  <option
                    key={type}
                    value={type}
                    className="bg-[var(--color-gray-800)]"
                  >
                    {type.toUpperCase()}
                  </option>
                ))}
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <FormLabel>Artists</FormLabel>
        <div className="space-y-2">
          {selectedArtists.map((artist, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={artist.name}
                onChange={(e) =>
                  onArtistChange(index, e.target.value, artistOptions)
                }
                placeholder="Artist name"
                list={`artists-${index}`}
                required
              />
              <datalist id={`artists-${index}`}>
                {artistOptions.map((a) => (
                  <option key={a.id} value={a.name} />
                ))}
              </datalist>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => onRemoveArtist(index)}
                  className="p-2 text-white/60 hover:text-white"
                >
                  <X size={14} strokeWidth={2} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={onAddArtist}
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add Artist
          </button>
        </div>
      </div>

      <FormField
        control={form.control}
        name="cover_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cover Image</FormLabel>
            <FormControl>
              <ImageUpload
                value={field.value}
                onUploadComplete={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="release_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Release Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} placeholder="Select Date" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="record_label"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Record Label</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Optional" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field, formState }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Add a description (optional)"
                rows={4}
                value={field.value || ""}
              />
            </FormControl>
            {formState.errors.description && (
              <FormMessage>{formState.errors.description.message}</FormMessage>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
