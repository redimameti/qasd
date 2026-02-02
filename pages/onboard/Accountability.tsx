import React, { useEffect, useState } from 'react';
import { navigate } from '../../lib/router';
import { LogoLink } from '../../components/LogoLink';
import { setOnboardingStep } from '../../lib/onboarding';

const OPTIONS = [
  'Rarely or never',
  'Occasionally, when things feel off',
  'Regularly, but without a system',
  'Consistently, with structure',
];

export const Accountability: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [details, setDetails] = useState('');

  useEffect(() => {
    setOnboardingStep('accountability');
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
                <h1 className="text-4xl font-bold serif">Accountability checkpoint</h1>
                <p className="text-sm text-[var(--text-muted)]">
                  How often do you intentionally account for your actions and time?
                </p>
              </div>

              <div className="space-y-3">
                {OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSelected(option)}
                    className={`w-full text-left border rounded-2xl px-5 py-4 text-sm font-semibold transition-colors ${
                      selected === option
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                        : 'border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] hover:border-[var(--primary)]'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {selected === 'Consistently, with structure' && (
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
                  <label className="text-xs font-semibold text-[var(--text-muted)]">Describe your structure</label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Share the system you use."
                    className="mt-2 w-full min-h-[120px] border border-[var(--border)] rounded-xl px-4 py-3 bg-[var(--background)] focus:outline-none focus:border-[var(--primary)] resize-none text-[var(--text-main)]"
                  />
                </div>
              )}

              <button
                onClick={() => {
                  setOnboardingStep('calendar');
                  navigate('/app/onboard/calendar');
                }}
                className="bg-[var(--primary)] text-black font-semibold px-6 py-3 rounded-xl hover:bg-[var(--secondary)] transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex bg-[var(--card)] border-l border-[var(--border)] items-center justify-center pointer-events-none select-none">
          <div className="relative min-h-[320px] flex items-center justify-center w-full max-w-[440px] px-6">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[var(--background)] via-[var(--background-elevated)] to-[var(--background)]" />
            <div className="relative z-10 bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] w-full max-w-sm">
              <div className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]/60 font-semibold mb-2">Reflection</div>
              <div className="text-lg font-semibold text-[var(--text-main)]">Weekly accountability</div>
              <div className="mt-4 space-y-2 text-sm text-[var(--text-muted)]">
                <div className="h-3 rounded-full bg-[var(--background)] border border-[var(--border)]" />
                <div className="h-3 rounded-full bg-[var(--background)] border border-[var(--border)]" />
                <div className="h-3 rounded-full bg-[var(--background)] border border-[var(--border)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
