import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Settings, Sliders } from 'lucide-react';
import { AccountSettings } from './AccountSettings';
import { SpotifySettings } from './SpotifySettings';
import { PreferenceSettings } from './PreferenceSettings';
import { useEffect } from 'react';
import { handleSpotifyCallback } from '../../../lib/spotify/auth';
import { useToast } from '../../../hooks/useToast';
import { useNavigate } from 'react-router-dom';

export function SettingsPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code && state) {
      handleSpotifyCallback(code, state)
        .then(() => {
          showToast({
            type: 'success',
            message: 'Spotify account connected successfully'
          });
          // Clear URL params
          navigate('/settings', { replace: true });
        })
        .catch((error) => {
          console.error('Error connecting Spotify:', error);
          showToast({
            type: 'error',
            message: 'Failed to connect Spotify account'
          });
        });
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <Tabs defaultValue="preferences" className="space-y-6">
        <TabsList>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Sliders className="w-4 h-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preferences">
          <PreferenceSettings />
        </TabsContent>
        
        <TabsContent value="account">
          <div className="space-y-8">
            <SpotifySettings />
            <AccountSettings />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}