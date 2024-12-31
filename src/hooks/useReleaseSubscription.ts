import { useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { subscribeToReleaseChanges } from '../lib/realtime/releaseSubscription';

export function useReleaseSubscription(onUpdate: () => void) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('Setting up subscription hook...');
    
    // Debounced update handler to prevent multiple rapid refreshes
    const handleUpdate = () => {
      console.log('Received update, debouncing...');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        console.log('Executing update...');
        onUpdate();
      }, 250); // Increased debounce time
    };

    // Set up subscription
    channelRef.current = subscribeToReleaseChanges(handleUpdate);

    // Cleanup
    return () => {
      console.log('Cleaning up subscription...');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [onUpdate]);
}