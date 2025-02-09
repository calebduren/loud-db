import { useRef, useEffect } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useToast } from './useToast';

const DEBOUNCE_TIME = 5000; // 5 seconds between updates
const COOLDOWN_TIME = 30000; // 30 seconds cooldown after error

export function useReleaseSubscription(onUpdate: () => void) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const lastErrorRef = useRef<number>(0);
  const errorCountRef = useRef<number>(0);
  const isInitialLoadRef = useRef(true);
  const isMountedRef = useRef(true);
  const { showToast } = useToast();

  useEffect(() => {
    // Skip the first update since it happens right after initial load
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    const handleUpdate = () => {
      if (!isMountedRef.current) return;

      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateRef.current;
      const timeSinceLastError = now - lastErrorRef.current;
      
      // If we had an error recently, enforce a longer cooldown
      if (timeSinceLastError < COOLDOWN_TIME && errorCountRef.current > 0) {
        console.debug('Skipping update, in error cooldown period', {
          timeSinceLastError,
          errorCount: errorCountRef.current
        });
        return;
      }

      // Skip updates that happen too soon after the last one
      if (timeSinceLastUpdate < DEBOUNCE_TIME) {
        console.debug('Skipping update, too soon after last update', {
          timeSinceLastUpdate
        });
        return;
      }

      console.debug('Received update, debouncing...', {
        timeSinceLastUpdate,
        timeSinceLastError
      });

      // Clear any pending update
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Schedule the update
      timeoutRef.current = setTimeout(async () => {
        if (!isMountedRef.current) return;

        try {
          console.debug('Executing update...');
          await onUpdate();
          if (!isMountedRef.current) return;
          
          lastUpdateRef.current = Date.now();
          // Reset error count on successful update
          errorCountRef.current = 0;
        } catch (error) {
          if (!isMountedRef.current) return;

          console.error('Error during subscription update', error);
          lastErrorRef.current = Date.now();
          errorCountRef.current++;
          
          // If we've had too many errors, unsubscribe and show toast
          if (errorCountRef.current >= 3) {
            console.warn('Too many subscription errors, unsubscribing...', {
              errorCount: errorCountRef.current
            });
            channelRef.current?.unsubscribe();
            showToast({
              message: "Having trouble getting updates. Please refresh the page.",
              type: "error"
            });
          }
        }
      }, 2000);
    };

    // Set up subscription
    console.debug('Setting up release subscription...');
    channelRef.current = supabase
      .channel('release_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'releases'
        },
        handleUpdate
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'release_genres'
        },
        handleUpdate
      )
      .subscribe((status) => {
        if (!isMountedRef.current) return;
        console.debug('Subscription status changed', { status });
      });

    // Cleanup
    return () => {
      isMountedRef.current = false;
      console.debug('Cleaning up subscription...');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [onUpdate, showToast]);
}