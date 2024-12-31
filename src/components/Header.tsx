import React from 'react';
import { Navigation } from './Navigation';
import { UserMenu } from './user/UserMenu';

export function Header() {
  return (
    <header className="border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Navigation />
        <UserMenu />
      </div>
    </header>
  );
}