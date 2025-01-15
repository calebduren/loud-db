import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicInfoTab } from "./tabs/BasicInfoTab";
import { TracksTab } from "./tabs/TracksTab";
import { GenresTab } from "./tabs/GenresTab";
import { LinksTab } from "./tabs/LinksTab";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./releaseFormSchema";

interface ReleaseFormTabsProps {
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

export function ReleaseFormTabs({
  form,
  selectedArtists,
  artistOptions,
  onArtistChange,
  onAddArtist,
  onRemoveArtist,
}: ReleaseFormTabsProps) {
  return (
    <Tabs defaultValue="basic" className="space-y-6">
      <TabsList onClick={(e) => e.stopPropagation()}>
        <TabsTrigger value="basic" className="flex items-center gap-2">
          Basic Info
        </TabsTrigger>
        <TabsTrigger value="tracks" className="flex items-center gap-2">
          Tracks
        </TabsTrigger>
        <TabsTrigger value="genres" className="flex items-center gap-2">
          Genres
        </TabsTrigger>
        <TabsTrigger value="links" className="flex items-center gap-2">
          Links
        </TabsTrigger>
      </TabsList>

      <TabsContent value="basic">
        <BasicInfoTab
          form={form}
          selectedArtists={selectedArtists}
          artistOptions={artistOptions}
          onArtistChange={onArtistChange}
          onAddArtist={onAddArtist}
          onRemoveArtist={onRemoveArtist}
        />
      </TabsContent>

      <TabsContent value="tracks">
        <TracksTab form={form} />
      </TabsContent>

      <TabsContent value="genres">
        <GenresTab form={form} />
      </TabsContent>

      <TabsContent value="links">
        <LinksTab form={form} />
      </TabsContent>
    </Tabs>
  );
}
