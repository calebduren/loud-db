import * as z from 'zod';
import { ReleaseType } from '../../../types/database';

const trackCreditSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Credit name is required'),
  role: z.string().min(1, 'Credit role is required')
});

const trackSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Track name is required'),
  track_number: z.number().min(1, 'Track number must be greater than 0'),
  duration_ms: z.number().min(0, 'Duration cannot be negative').default(0),
  preview_url: z.string().nullable().optional(),
  credits: z.array(trackCreditSchema).optional().default([])
});

export const formSchema = z.object({
  name: z.string().min(1, 'Release name is required').max(200, 'Release name is too long'),
  release_type: z.enum(['single', 'EP', 'LP', 'compilation'] as const, {
    required_error: 'Please select a release type'
  }),
  cover_url: z.string().optional(),
  genres: z.array(z.string()).default([]),
  record_label: z.string().optional(),
  track_count: z.coerce.number().min(0, 'Track count must be 0 or greater'),
  spotify_url: z.string().url().optional().or(z.literal('')),
  apple_music_url: z.string().url().optional().or(z.literal('')),
  release_date: z.string().min(1, 'Release date is required'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional().or(z.literal('')),
  created_by: z.string().optional(),
  tracks: z.array(trackSchema).optional().default([])
});

export type FormValues = z.infer<typeof formSchema>;

export const initialFormData: FormValues = {
  name: '',
  release_type: 'single',
  cover_url: '',
  genres: [],
  record_label: '',
  track_count: 0,
  spotify_url: '',
  apple_music_url: '',
  release_date: new Date().toISOString().split('T')[0],
  description: '',
  created_by: undefined,
  tracks: []
};