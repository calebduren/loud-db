import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../releaseFormSchema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { FormInput } from "@/components/ui/form-input";
import { ReleaseTypeInput } from "../ReleaseTypeInput";
import { ImageUpload } from "../../ImageUpload";
import { ArtistSearchInput } from "../ArtistSearchInput";
import { Textarea } from "@/components/ui/textarea";

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

export function BasicInfoTab({
  form,
  selectedArtists,
  artistOptions,
  onArtistChange,
  onAddArtist,
  onRemoveArtist,
}: BasicInfoTabProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="cover_url"
        render={({ field }) => (
          <FormItem>
            <div>
              <FormLabel>Cover artwork</FormLabel>
              <FormDescription className="text-[--color-gray-400]">
                640px&times;640px recommended
              </FormDescription>
            </div>
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
        name="name"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <FormInput
                placeholder="Enter release title"
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
            <FormLabel>Length</FormLabel>
            <FormControl>
              <ReleaseTypeInput value={field.value} onChange={field.onChange} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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
            <FormLabel>Record label</FormLabel>
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
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter release description"
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
