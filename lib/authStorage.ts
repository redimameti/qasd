const SIGNUP_EMAIL_KEY = 'qasd_signup_email';
const CHANGE_ACCOUNT_KEY = 'qasd_change_account';
const VERIFICATION_NOTICE_KEY = 'qasd_verification_notice';

export const setSignupEmail = (email: string) => {
  localStorage.setItem(SIGNUP_EMAIL_KEY, email);
};

export const getSignupEmail = (): string | null => localStorage.getItem(SIGNUP_EMAIL_KEY);

export const clearSignupEmail = () => {
  localStorage.removeItem(SIGNUP_EMAIL_KEY);
};

export const setChangeAccount = (value: boolean) => {
  if (value) {
    localStorage.setItem(CHANGE_ACCOUNT_KEY, 'true');
  } else {
    localStorage.removeItem(CHANGE_ACCOUNT_KEY);
  }
};

export const getChangeAccount = (): boolean => localStorage.getItem(CHANGE_ACCOUNT_KEY) === 'true';

export const setVerificationNotice = (message: string) => {
  localStorage.setItem(VERIFICATION_NOTICE_KEY, message);
};

export const getVerificationNotice = (): string | null => localStorage.getItem(VERIFICATION_NOTICE_KEY);

export const clearVerificationNotice = () => {
  localStorage.removeItem(VERIFICATION_NOTICE_KEY);
};
