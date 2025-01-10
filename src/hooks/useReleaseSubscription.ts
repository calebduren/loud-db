import { useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { subscribeToReleaseChanges } from '../lib/realtime/releaseSubscription';

export function useReleaseSubscription(onUpdate: () => void) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    console.log('Setting up subscription hook...');
    
    // Debounced update handler to prevent multiple rapid refreshes
    const handleUpdate = () => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateRef.current;
      
      // Skip updates that happen too soon after a manual update
      if (timeSinceLastUpdate < 2000) {
        console.log('Skipping update, too soon after last update');
        return;
      }

      console.log('Received update, debouncing...');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        console.log('Executing update...');
        onUpdate();
      }, 1000); // Increased debounce time
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

  // Return a function to update the lastUpdate timestamp
  return {
    markAsUpdated: () => {
      lastUpdateRef.current = Date.now();
    }
  };
}