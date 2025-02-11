import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '../releaseFormSchema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { getAppleMusicUrl } from '@/api/music';
import { useToast } from '@/hooks/useToast';

interface LinksTabProps {
  form: UseFormReturn<FormValues>;
}

export function LinksTab({ form }: LinksTabProps) {
  const { showToast } = useToast();

  // Watch for changes to spotify_url to auto-fill apple_music_url
  useEffect(() => {
    const subscription = form.watch(async (value, { name, type }) => {
      // Only proceed if spotify_url changed by user input and has a value
      if (name === 'spotify_url' && value.spotify_url && type === 'change') {
        try {
          const appleMusicUrl = await getAppleMusicUrl(value.spotify_url);
          if (appleMusicUrl) {
            // Only set if apple_music_url is empty
            const currentAppleUrl = form.getValues('apple_music_url');
            if (!currentAppleUrl) {
              form.setValue('apple_music_url', appleMusicUrl);
            }
          }
        } catch (error) {
          console.error('Error fetching Apple Music URL:', error);
          showToast({
            message: 'Failed to fetch Apple Music URL',
            type: 'error'
          });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form, showToast]);

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