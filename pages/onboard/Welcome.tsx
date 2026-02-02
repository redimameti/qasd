import React, { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { navigate } from '../../lib/router';
import { LogoLink } from '../../components/LogoLink';
import { setOnboardingStep } from '../../lib/onboarding';

export const Welcome: React.FC = () => {
  useEffect(() => {
    setOnboardingStep('welcome');
  }, []);

  return (
    <div className="min-h-screen text-[var(--text-main)]">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        <div className="bg-[var(--background)] flex flex-col min-h-screen">
          <div className="w-full px-6 pt-8">
            <div className="w-full max-w-[440px] mx-auto">
              <LogoLink />
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-[440px] px-6 space-y-6">
              <h1 className="text-4xl font-bold serif">Welcome to Juhd!</h1>
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
                <p className="text-sm text-[var(--text-muted)] font-semibold">Juhd can help you...</p>
                <div className="space-y-3 text-sm text-[var(--text-muted)]">
                  {[
                    'Organize the weekly chaos',
                    'Focus on the right things',
                    'Align your goals with your deen',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-[var(--primary)]" />
                      <span>{item}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 text-[var(--text-main)] font-semibold">
                    <div className="w-4 h-4 rounded-full border border-[var(--border)]" />
                    Now it&apos;s your turn! ✨
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setOnboardingStep('user-profile');
                  navigate('/app/onboard/user-profile');
                }}
                className="bg-[var(--primary)] text-black font-semibold px-6 py-3 rounded-xl hover:bg-[var(--secondary)] transition-colors"
              >
                Let&apos;s go!
              </button>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex bg-[var(--card)] border-l border-[var(--border)] items-center justify-center pointer-events-none select-none">
          <div className="w-full max-w-[440px] px-6 space-y-6">
            <div className="grid grid-cols-2 gap-6 text-sm text-[var(--text-muted)]">
              {[
                { label: '30M+', sub: 'app downloads' },
                { label: '15 years+', sub: 'in business' },
                { label: '2B+', sub: 'tasks completed' },
                { label: '350K+', sub: 'five-star reviews' },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="text-2xl font-bold text-[var(--text-main)]">{item.label}</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]/60">{item.sub}</div>
                </div>
              ))}
            </div>
            <div className="rounded-3xl bg-[var(--card)] border border-[var(--border)] p-6 text-sm text-[var(--text-muted)]">
              Built for founders who want a 12-week operating system grounded in intentionality.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
