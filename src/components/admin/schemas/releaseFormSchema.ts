import * as z from 'zod';
import { ReleaseType } from '../../../types/database';

const relatedArtistSchema = z.object({
  name: z.string(),
  popularity: z.number().optional(),
  topTracks: z.array(z.object({
    name: z.string(),
    preview_url: z.string().nullable()
  })).optional()
});

export const formSchema = z.object({
  name: z.string().min(1, 'Release name is required'),
  release_type: z.enum(['single', 'EP', 'LP', 'compilation'] as const),
  cover_url: z.string().optional(),
  genres: z.array(z.string()),
  record_label: z.string().optional(),
  track_count: z.coerce.number().min(1, 'Must have at least one track'),
  spotify_url: z.string().url().optional().or(z.literal('')),
  apple_music_url: z.string().url().optional().or(z.literal('')),
  release_date: z.string(),
  related_artists: z.array(relatedArtistSchema).default([])
});

export type FormValues = z.infer<typeof formSchema>;

export const initialFormData: FormValues = {
  name: '',
  release_type: 'single',
  cover_url: '',
  genres: [],
  record_label: '',
  track_count: 1,
  spotify_url: '',
  apple_music_url: '',
  release_date: new Date().toISOString().split('T')[0],
  related_artists: []
};

export interface ReleaseFormProps {
  release?: Release;
  onSuccess?: () => void;
}