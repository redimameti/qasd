import React, { useMemo } from 'react';
import { Auth } from '../components/Auth';
import { LogoLink } from '../components/LogoLink';
import { navigate } from '../lib/router';

type AuthMode = 'login' | 'signup';

interface AuthPageProps {
  mode: AuthMode;
  notice?: string | null;
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode, notice }) => {
  const rightColumn = useMemo(() => {
    return (
      <div className="flex items-center justify-center">
        <div className="w-full max-w-sm">
          <div className="mx-auto w-[260px] rounded-[32px] border border-[var(--border)] bg-[var(--background)] shadow-[0_24px_60px_rgba(0,0,0,0.35)] p-4">
            <div className="h-4 w-16 rounded-full bg-[var(--border)] mx-auto mb-4" />
            <div className="space-y-4">
              <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-4">
                <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)]">Goal</p>
                <h4 className="text-sm font-semibold text-[var(--text-main)]">Scale Digital Agency</h4>
              </div>
              <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>Weekly</span>
                  <span className="text-[var(--primary)]">On track</span>
                </div>
                <div className="flex items-center justify-between text-sm text-[var(--text-main)]">
                  <span>Refine Landing Page Copy</span>
                  <span className="text-[var(--text-muted)]">1/1</span>
                </div>
              </div>
              <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>Daily</span>
                  <span className="text-[var(--secondary)]">Momentum</span>
                </div>
                <div className="flex items-center justify-between text-sm text-[var(--text-main)]">
                  <span>Cold Outreach</span>
                  <span className="text-[var(--text-muted)]">4/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }, []);

  return (
    <div className="min-h-screen text-[var(--text-main)]">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        <div className="bg-[var(--background)] flex flex-col min-h-screen">
          <div className="w-full px-6 pt-8">
            <div className="w-full max-w-[440px] mx-auto">
              <LogoLink className="tracking-tight" />
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-[440px] px-6">
              <Auth
                mode={mode}
                onModeChange={(next) => navigate(next === 'login' ? '/auth/login' : '/auth/signup')}
                notice={notice}
              />
            </div>
          </div>
        </div>

        <div className="hidden lg:flex bg-[var(--card)] border-l border-[var(--border)] items-center justify-center pointer-events-none select-none">
          {rightColumn}
        </div>
      </div>
    </div>
  );
};
