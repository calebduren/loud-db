import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface LegalPageProps {
  title: string;
  children: React.ReactNode;
}

export function LegalPage({ title, children }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Home
        </Link>

        <div className="bg-white/5 rounded-lg border border-white/10 p-8 space-y-8">
          <div className="border-b border-white/10 pb-8">
            <h1 className="text-3xl font-bold mb-2">{title}</h1>
            <p className="text-sm text-white/60">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-4 [&_p]:text-white/80 [&_p]:leading-relaxed [&_section]:space-y-4 [&_ul]:space-y-2 [&_li]:text-white/80 [&_li]:pl-4 [&_li]:relative [&_li]:before:content-['•'] [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:text-white/40">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}