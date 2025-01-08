import React, { useState } from 'react';
import { PageTitle } from '../layout/PageTitle';
import { ReleaseListSkeleton } from '../releases/ReleaseListSkeleton';

type ComponentType = 'skeleton' | 'button' | 'input' | 'pill';

interface ComponentOption {
  value: ComponentType;
  label: string;
  description: string;
}

const COMPONENT_OPTIONS: ComponentOption[] = [
  {
    value: 'skeleton',
    label: 'Loading Skeletons',
    description: 'Placeholder components shown during content loading'
  },
  {
    value: 'button',
    label: 'Buttons',
    description: 'Various button styles and states'
  },
  {
    value: 'input',
    label: 'Form Inputs',
    description: 'Text inputs, selects, and other form controls'
  },
  {
    value: 'pill',
    label: 'Pills',
    description: 'Rounded pill components for tags and filters'
  }
];

export function ComponentLibrary() {
  const [selectedComponent, setSelectedComponent] = useState<ComponentType>('skeleton');

  const renderComponent = () => {
    switch (selectedComponent) {
      case 'skeleton':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Release Card Skeleton</h3>
              <p className="text-white/60 mb-6">
                Used as a placeholder while release data is being loaded. Shows a grid of cards
                with animated loading states.
              </p>
              <div className="p-6 bg-white/5 rounded-lg">
                <ReleaseListSkeleton />
              </div>
            </div>
          </div>
        );
      // We'll add other component cases later
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageTitle 
        title="Component Library" 
        subtitle="Preview and customize UI components"
      />

      <div className="mb-8">
        <label htmlFor="component-select" className="block text-sm font-medium text-white/60 mb-2">
          Select Component
        </label>
        <div className="relative">
          <select
            id="component-select"
            value={selectedComponent}
            onChange={(e) => setSelectedComponent(e.target.value as ComponentType)}
            className="w-full px-4 py-2 bg-white/5 rounded-md text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {COMPONENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {COMPONENT_OPTIONS.find(opt => opt.value === selectedComponent)?.description && (
          <p className="mt-2 text-sm text-white/60">
            {COMPONENT_OPTIONS.find(opt => opt.value === selectedComponent)?.description}
          </p>
        )}
      </div>

      {renderComponent()}
    </div>
  );
}
