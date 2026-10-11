import { ReactNode } from 'react';

export type AuthViewMode = 'signin' | 'signup' | 'forgot' | 'otp';

export interface SocialProviderConfig {
  id: 'google' | 'apple' | string;
  name: string;
  label: string;
  enabled: boolean;
  unavailableNotice?: string;
}

export interface AuthFormState {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  rememberMe?: boolean;
}

export interface AuthUIState {
  view: AuthViewMode;
  isLoading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  validationError: string | null;
  prefilledEmail?: string;
}

export interface AuthExperienceConfig {
  allowRememberMe?: boolean;
  enableGoogleAuth?: boolean;
  enableAppleAuth?: boolean;
  termsUrl?: string;
  privacyUrl?: string;
  headline?: string;
  subheadline?: string;
  lifestyleImagePath?: string;
}

export interface AuthAnimationOptions {
  enableEntranceAnimation?: boolean;
  enableImageZoom?: boolean;
  enableStagger?: boolean;
}
