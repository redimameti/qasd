import React, { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import { navigate } from '../../lib/router';
import { LogoLink } from '../../components/LogoLink';
import { setOnboardingStep } from '../../lib/onboarding';

export const UserProfile: React.FC = () => {
  const [name, setName] = useState('');

  useEffect(() => {
    setOnboardingStep('user-profile');
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
              <div className="space-y-2">
                <h1 className="text-4xl font-bold serif">What&apos;s your name?</h1>
                <p className="text-sm text-[var(--text-muted)]">Complete your profile so we can personalize your journey.</p>
              </div>
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-5">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)]">Your name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="mt-2 w-full border border-[var(--border)] rounded-xl px-4 py-3 bg-[var(--background)] focus:outline-none focus:border-[var(--primary)] text-[var(--text-main)]"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] font-bold text-xl">
                    {name ? name.charAt(0).toUpperCase() : 'ج'}
                  </div>
                  <button
                    type="button"
                    className="border border-[var(--border)] rounded-xl px-4 py-2 text-sm font-semibold text-[var(--text-muted)] flex items-center gap-2"
                  >
                    <Camera size={16} /> Upload photo
                  </button>
                </div>
              </div>
              <button
                onClick={() => {
                  setOnboardingStep('accountability');
                  navigate('/app/onboard/accountability');
                }}
                className="bg-[var(--primary)] text-black font-semibold px-6 py-3 rounded-xl hover:bg-[var(--secondary)] transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex bg-[var(--card)] border-l border-[var(--border)] items-center justify-center pointer-events-none select-none">
          <div className="relative min-h-[320px] flex items-center justify-center w-full max-w-[440px] px-6">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[var(--background)] via-[var(--background-elevated)] to-[var(--background)]" />
            <div className="relative z-10 bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] w-full max-w-sm">
              <div className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]/60 font-semibold mb-2">Preview</div>
              <div className="text-lg font-semibold text-[var(--text-main)]">Execution Dashboard</div>
              <div className="mt-4 h-24 rounded-2xl bg-[var(--background)] border border-[var(--border)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
