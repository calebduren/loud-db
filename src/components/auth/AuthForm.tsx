import React from 'react';
import { AuthTabs } from './AuthTabs';
import { useSearchParams } from 'react-router-dom';
import { Logo } from '../ui/Logo';

export function AuthForm() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <Logo className="w-[24px] h-[32px] mx-auto mb-4 text-white" />
        <h1 className="text-2xl font-bold text-white mb-1">Loud</h1>
        <p className="text-white/80">Find your next obsession</p>
      </div>
      <div className="card">
        <AuthTabs defaultTab={mode === 'reset' ? 'reset' : 'signin'} />
      </div>
    </div>
  );
}