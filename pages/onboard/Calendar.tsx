import React, { useEffect } from 'react';
import { CalendarDays } from 'lucide-react';
import { navigate } from '../../lib/router';
import { LogoLink } from '../../components/LogoLink';
import { setOnboardingStep } from '../../lib/onboarding';

const CalendarCard: React.FC<{ label: string }> = ({ label }) => (
  <div className="relative bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 flex items-center gap-4 overflow-hidden">
    <div className="w-12 h-12 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)]">
      <CalendarDays size={20} />
    </div>
    <div>
      <div className="text-sm font-semibold text-[var(--text-main)]">{label}</div>
      <div className="text-xs text-[var(--text-muted)]">Sync your events in one place.</div>
    </div>
    <div className="absolute inset-0 bg-[var(--background)]/70 backdrop-blur-sm flex items-center justify-center text-xs font-semibold text-[var(--primary)]">
      Coming soon
    </div>
  </div>
);

export const Calendar: React.FC = () => {
  useEffect(() => {
    setOnboardingStep('calendar');
  }, []);

  const finishOnboarding = () => {
    setOnboardingStep('done');
    navigate('/app/dashboard');
  };

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
                <h1 className="text-4xl font-bold serif">How do you manage events?</h1>
                <p className="text-sm text-[var(--text-muted)]">
                  See your tasks and events side-by-side to get the full picture.
                </p>
              </div>

              <div className="space-y-4">
                <CalendarCard label="Connect Google Calendar" />
                <CalendarCard label="Connect Outlook Calendar" />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={finishOnboarding}
                  className="flex-1 bg-[var(--primary)] text-black font-semibold px-6 py-3 rounded-xl hover:bg-[var(--secondary)] transition-colors"
                >
                  Finish setup
                </button>
                <button
                  onClick={finishOnboarding}
                  className="flex-1 border border-[var(--border)] text-[var(--text-muted)] font-semibold px-6 py-3 rounded-xl hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex bg-[var(--card)] border-l border-[var(--border)] items-center justify-center pointer-events-none select-none">
          <div className="relative min-h-[320px] flex items-center justify-center w-full max-w-[440px] px-6">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[var(--background)] via-[var(--background-elevated)] to-[var(--background)]" />
            <div className="relative z-10 bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] w-full max-w-sm">
              <div className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]/60 font-semibold mb-2">Calendar view</div>
              <div className="text-lg font-semibold text-[var(--text-main)]">Upcoming</div>
              <div className="mt-4 h-28 rounded-2xl bg-[var(--background)] border border-[var(--border)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
