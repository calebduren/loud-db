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
    <Tabs defaultValue="basic" className="tabs">
      <TabsList onClick={(e) => e.stopPropagation()} className="tabs__list">
        <TabsTrigger value="basic" className="tabs__trigger">
          <span className="tabs__trigger-icon">Basic Info</span>
        </TabsTrigger>
        <TabsTrigger value="tracks" className="tabs__trigger">
          <span className="tabs__trigger-icon">Tracks</span>
        </TabsTrigger>
        <TabsTrigger value="genres" className="tabs__trigger">
          <span className="tabs__trigger-icon">Genres</span>
        </TabsTrigger>
        <TabsTrigger value="links" className="tabs__trigger">
          <span className="tabs__trigger-icon">Links</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="tabs__content">
        <BasicInfoTab
          form={form}
          selectedArtists={selectedArtists}
          artistOptions={artistOptions}
          onArtistChange={onArtistChange}
          onAddArtist={onAddArtist}
          onRemoveArtist={onRemoveArtist}
        />
      </TabsContent>

      <TabsContent value="tracks" className="tabs__content">
        <TracksTab form={form} />
      </TabsContent>

      <TabsContent value="genres" className="tabs__content">
        <GenresTab form={form} />
      </TabsContent>

      <TabsContent value="links" className="tabs__content">
        <LinksTab form={form} />
      </TabsContent>
    </Tabs>
  );
}
