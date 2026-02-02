export type OnboardingStep = 'welcome' | 'user-profile' | 'accountability' | 'calendar' | 'done';

const ONBOARDING_STEP_KEY = 'qasd_onboarding_step';

export const getOnboardingStep = (): OnboardingStep | null => {
  const value = localStorage.getItem(ONBOARDING_STEP_KEY);
  if (!value) return null;
  if (value === 'welcome' || value === 'user-profile' || value === 'accountability' || value === 'calendar' || value === 'done') {
    return value;
  }
  return null;
};

export const setOnboardingStep = (step: OnboardingStep) => {
  localStorage.setItem(ONBOARDING_STEP_KEY, step);
};

export const clearOnboardingStep = () => {
  localStorage.removeItem(ONBOARDING_STEP_KEY);
};
