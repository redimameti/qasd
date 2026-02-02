import React, { useEffect, useState } from 'react';
import { Check, Loader2, AlertTriangle } from 'lucide-react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SavingStatusProps {
  status: SaveStatus;
  message?: string | null;
}

export const SavingStatus: React.FC<SavingStatusProps> = ({ status, message }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status === 'saving' || status === 'saved' || status === 'error') {
      setVisible(true);
    }

    // Auto-hide after 3 seconds of being in 'saved' state
    if (status === 'saved') {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
    if (status === 'error') {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (!visible) return null;

  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--card)]/80 backdrop-blur-md border border-[var(--border)] shadow-lg">
        {status === 'saving' && (
          <>
            <Loader2 size={12} className="text-[var(--secondary)] animate-spin" />
            <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-[var(--secondary)]">
              Auto-Saving...
            </span>
          </>
        )}
        {status === 'saved' && (
          <>
            <div className="w-3 h-3 bg-[var(--primary)] rounded-full flex items-center justify-center">
              <Check size={8} className="text-black" strokeWidth={3} />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-[var(--primary)]">
              Changes Saved
            </span>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertTriangle size={12} className="text-[var(--error)]" />
            <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-[var(--error)]">
              Save Failed{message ? `: ${message}` : ''}
            </span>
          </>
        )}
      </div>
    </div>
  );
};
