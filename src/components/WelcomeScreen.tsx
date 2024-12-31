import React from 'react';
import { AuthForm } from './auth/AuthForm';

export function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <AuthForm />
    </div>
  );
}