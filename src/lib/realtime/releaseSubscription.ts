import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../supabase';

const TABLES = ['releases', 'release_artists', 'artists', 'tracks'] as const;

export function subscribeToReleaseChanges(onUpdate: () => void): RealtimeChannel {
  console.log('Setting up realtime subscription...');
  
  const channel = supabase.channel('release-changes', {
    config: {
      broadcast: { self: true }
    }
  });
  
  // Subscribe to all relevant tables
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