import React from "react";
import { ReleaseType } from "../../types/database";
import { Plus, X } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { GenresInput } from "./GenresInput";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

const RELEASE_TYPES: (ReleaseType | "")[] = [
  "",
  "single",
  "EP",
  "LP",
  "compilation",
];

interface ReleaseFormFieldsProps {
  form: any;
  selectedArtists: { id?: string; name: string }[];
  artistOptions: { id: string; name: string }[];
  onArtistChange: (
    index: number,
    value: string,
    availableArtists: { id: string; name: string }[]
  ) => void;
  onAddArtist: () => void;
  onRemoveArtist: (index: number) => void;
}

export function ReleaseFormFields({
  form,
  selectedArtists,
  artistOptions,
  onArtistChange,
  onAddArtist,
  onRemoveArtist,
}: ReleaseFormFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Basic Info */}
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
                className="flex h-[34px] w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20"
              >
                <option value="" className="bg-[var(--color-gray-800)]">
                  Select Type
                </option>
                {RELEASE_TYPES.filter(Boolean).map((type) => (
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

      {/* Artists */}
      <div className="md:col-span-2">
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

      {/* Cover Image */}
      <div className="md:col-span-2">
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
      </div>

      {/* Genres */}
      <div className="md:col-span-2">
        <FormField
          control={form.control}
          name="genres"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Genres</FormLabel>
              <FormControl>
                <GenresInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Release Details */}
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

      {/* Streaming Links */}
      <FormField
        control={form.control}
        name="spotify_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Spotify URL</FormLabel>
            <FormControl>
              <Input type="url" {...field} placeholder="Optional" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="apple_music_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Apple Music URL</FormLabel>
            <FormControl>
              <Input type="url" {...field} placeholder="Optional" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
