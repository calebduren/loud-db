import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '../releaseFormSchema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { GenresInput } from '../../GenresInput';

interface GenresTabProps {
  form: UseFormReturn<FormValues>;
}

export function GenresTab({ form }: GenresTabProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="genres"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Genres</FormLabel>
            <FormControl>
              <GenresInput
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}