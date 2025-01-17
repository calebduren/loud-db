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
import { FormInput } from "@/components/ui/form-input";
import { FormTextarea } from "@/components/ui/form-textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/filter-select";
import { ImageUpload } from "../../ImageUpload";
import { ArtistSearchInput } from "../ArtistSearchInput";

interface Artist {
  id?: string;
  name: string;
}

interface BasicInfoTabProps {
  form: UseFormReturn<FormValues>;
  selectedArtists: Artist[];
  artistOptions: Artist[];
  onArtistChange: (
    index: number,
    value: string,
    availableArtists: Artist[]
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
        name="name"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>Release Name</FormLabel>
            <FormControl>
              <FormInput
                placeholder="Enter release name"
                error={fieldState.error?.message}
                {...field}
              />
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
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {RELEASE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-2">
        <FormLabel>Artists</FormLabel>
        <ArtistSearchInput
          selectedArtists={selectedArtists}
          artistOptions={artistOptions}
          onArtistChange={onArtistChange}
          onAddArtist={onAddArtist}
          onRemoveArtist={onRemoveArtist}
        />
      </div>

      <FormField
        control={form.control}
        name="release_date"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>Release Date</FormLabel>
            <FormControl>
              <FormInput
                type="date"
                error={fieldState.error?.message}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="record_label"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>Record Label</FormLabel>
            <FormControl>
              <FormInput
                placeholder="Enter record label"
                error={fieldState.error?.message}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <FormTextarea
                placeholder="Enter release description"
                error={fieldState.error?.message}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
