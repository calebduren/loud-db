import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AllReleases } from './releases/AllReleases';
import { LikedReleases } from './releases/LikedReleases';
import { SettingsPage } from '../user/settings/SettingsPage';
import { UserManagement } from './users/UserManagement';
import { GenreMappingManager } from './genres/GenreMappingManager';

export function AdminDashboard() {
  return (
    <div className="mt-8">
      <Routes>
        <Route path="/" element={<AllReleases />} />
        <Route path="/likes" element={<LikedReleases />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/genres" element={<GenreMappingManager />} />
      </Routes>
    </div>
  );
}