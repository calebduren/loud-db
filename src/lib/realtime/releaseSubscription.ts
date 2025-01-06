import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../supabase';

// Only subscribe to the main releases view since it contains all the data we need
const TABLES = ['releases_view'] as const;

export function subscribeToReleaseChanges(onUpdate: () => void): RealtimeChannel {
  console.log('Setting up realtime subscription...');
  
  const channel = supabase.channel('release-changes');
  
  // Subscribe to the releases view
  TABLES.forEach(table => {
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      (payload) => {
        console.log(`Received change for ${table}:`, payload);
        onUpdate();
      }
    );
  });

  channel.subscribe((status) => {
    console.log('Subscription status:', status);
  });

  return channel;
}