import React from 'react';
import { Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GenrePreferences } from '../user/settings/GenrePreferences';
import { Button } from '../ui/button';

export function OnboardingFlow() {
  const navigate = useNavigate();

  const handleSkip = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-4">
          <Music className="w-16 h-16 mx-auto" />
          <h1 className="text-3xl font-bold">Welcome to loud db!</h1>
          <p className="text-white/60">
            Let's personalize your experience by setting up your genre preferences.
            This will help us show you releases you'll love.
          </p>
          <Button 
            variant="ghost" 
            onClick={handleSkip}
            className="text-white/60 hover:text-white"
          >
            Skip for now
          </Button>
        </div>

        <GenrePreferences onComplete={() => navigate('/')} />
      </div>
    </div>
  );
}