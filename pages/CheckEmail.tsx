import React, { useEffect, useState } from 'react';
import { Mail, RotateCcw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { clearSignupEmail, clearVerificationNotice, getSignupEmail, getVerificationNotice, setChangeAccount } from '../lib/authStorage';
import { navigate } from '../lib/router';
import { LogoLink } from '../components/LogoLink';

export const CheckEmail: React.FC = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  useEffect(() => {
    setEmail(getSignupEmail());
    const storedNotice = getVerificationNotice();
    if (storedNotice) {
      setNotice(storedNotice);
      clearVerificationNotice();
    }
  }, []);

  const handleResend = async () => {
    if (!email) return;
    setResendStatus('sending');
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw error;
      setResendStatus('sent');
    } catch (err) {
      console.error('Resend error:', err);
      setNotice('We could not resend the email yet. Please try again.');
      setResendStatus('idle');
    }
  };

  const handleChangeAccount = () => {
    clearSignupEmail();
    setChangeAccount(true);
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen text-[var(--text-main)]">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        <div className="bg-[var(--background)] flex flex-col min-h-screen">
          <div className="w-full px-6 pt-8">
            <div className="w-full max-w-[440px] mx-auto flex items-center justify-between">
              <LogoLink className="tracking-tight" />
              <button
                onClick={() => navigate('/auth/login')}
                className="text-sm font-semibold text-[var(--primary)] hover:underline"
              >
                Back to login
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-[440px] px-6 space-y-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold serif">Check your email</h1>
                <p className="text-sm text-[var(--text-muted)]">
                  To start using Juhd we need you to confirm your account.
                </p>
              </div>

              {notice && (
                <div className="p-3 bg-[var(--secondary)]/10 border border-[var(--secondary)]/20 rounded-xl text-[var(--secondary)] text-xs font-semibold">
                  {notice}
                </div>
              )}

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
                <div className="flex items-start gap-3 text-sm text-[var(--text-muted)]">
                  <Mail size={18} className="text-[var(--primary)] mt-0.5" />
                  <div>
                    <p>Please click the link we sent to:</p>
                    <p className="font-semibold text-[var(--text-main)]">{email || 'your email address'}</p>
                    <button
                      type="button"
                      onClick={handleChangeAccount}
                      className="text-xs font-semibold text-[var(--primary)] hover:underline mt-2"
                    >
                      Not the right email? Change account
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={!email || resendStatus === 'sending'}
                    className="flex-1 border border-[var(--border)] rounded-xl py-3 text-sm font-semibold text-[var(--text-muted)] bg-[var(--background)] hover:border-[var(--primary)] transition-colors disabled:opacity-60"
                  >
                    {resendStatus === 'sending' ? 'Sending...' : resendStatus === 'sent' ? 'Email sent' : 'Resend email'}
                  </button>
                  <a
                    href="mailto:"
                    className="flex-1 bg-[var(--primary)] text-black text-sm font-semibold py-3 rounded-xl text-center hover:bg-[var(--secondary)] transition-colors"
                  >
                    Open email inbox
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex bg-[var(--card)] border-l border-[var(--border)] items-center justify-center pointer-events-none select-none">
          <div className="relative flex items-center justify-center min-h-[320px]">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[var(--background)] via-[var(--background-elevated)] to-[var(--background)]" />
            <div className="relative z-10 w-56 h-56 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center">
              <div className="w-32 h-20 bg-[var(--background)] border border-[var(--border)] rounded-2xl flex items-center justify-center relative">
                <RotateCcw size={20} className="text-[var(--primary)]" />
                <div className="absolute -top-6 -right-4 w-10 h-10 bg-[var(--primary)] text-black rounded-full flex items-center justify-center text-sm font-bold">
                  ✓
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
