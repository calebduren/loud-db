import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '../releaseFormSchema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface LinksTabProps {
  form: UseFormReturn<FormValues>;
}

export function LinksTab({ form }: LinksTabProps) {
  return (
    <div className="space-y-6">
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