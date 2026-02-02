import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingScreen: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-main)] flex items-center justify-center">
      <div className="flex items-center gap-3 text-sm font-semibold">
        <Loader2 size={16} className="animate-spin text-[var(--primary)]" />
        <span>{message || 'Loading...'}</span>
      </div>
    </div>
  );
};
