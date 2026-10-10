'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserSession, DbProfile, DbAddress, UserRoleEnum, ApiResponse, AuthResponseData } from '@/types';

export interface OtpChallengeState {
  email: string;
  challengeToken: string;
  type: 'LOGIN' | 'REGISTER';
  cooldownSeconds?: number;
}

interface AuthContextType {
  user: UserSession | null;
  profile: DbProfile | null;
  addresses: DbAddress[];
  permissions: string[];
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isAuthModalOpen: boolean;
  authModalView: 'signin' | 'signup' | 'forgot' | 'otp';
  otpChallenge: OtpChallengeState | null;
  openAuthModal: (view?: 'signin' | 'signup' | 'forgot' | 'otp') => void;
  closeAuthModal: () => void;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; requiresOtp?: boolean; challengeToken?: string; email?: string; message?: string }>;
  register: (data: { email: string; password: string; firstName?: string; lastName?: string; phone?: string }) => Promise<{ success: boolean; requiresOtp?: boolean; challengeToken?: string; email?: string; message?: string }>;
  verifyOtp: (params: { email: string; challengeToken: string; otp: string }) => Promise<{ success: boolean; message?: string }>;
  resendOtp: (params: { email: string; challengeToken: string }) => Promise<{ success: boolean; message?: string; cooldownSeconds?: number }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (profileData: Partial<DbProfile>) => Promise<boolean>;
  addAddress: (addressData: any) => Promise<DbAddress | null>;
  removeAddress: (addressId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [addresses, setAddresses] = useState<DbAddress[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'signin' | 'signup' | 'forgot' | 'otp'>('signin');
  const [otpChallenge, setOtpChallenge] = useState<OtpChallengeState | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const json: ApiResponse<{ user: UserSession & { profile?: DbProfile; addresses?: DbAddress[] }; permissions: string[] }> = await res.json();
        if (json.success && json.data) {
          setUser(json.data.user);
          setProfile(json.data.user.profile || null);
          setAddresses(json.data.user.addresses || []);
          setPermissions(json.data.permissions || []);
        } else {
          setUser(null);
          setProfile(null);
          setAddresses([]);
          setPermissions([]);
        }
      } else {
        setUser(null);
        setProfile(null);
        setAddresses([]);
        setPermissions([]);
      }
    } catch {
      setUser(null);
      setProfile(null);
      setAddresses([]);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Auto-show login experience after 1 second on initial website visit (if not logged in)
  useEffect(() => {
    if (!isLoading && !user) {
      const hasAutoPrompted = typeof window !== 'undefined' ? sessionStorage.getItem('veloura_auto_auth_prompted') : null;
      if (!hasAutoPrompted) {
        const timer = setTimeout(() => {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('veloura_auto_auth_prompted', 'true');
          }
          setIsAuthModalOpen(true);
          setAuthModalView('signin');
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, user]);

  const openAuthModal = useCallback((view: 'signin' | 'signup' | 'forgot' | 'otp' = 'signin') => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.error?.message || 'Login failed. Please verify credentials.',
        };
      }

      // Mandatory OTP challenge response
      if (data.data?.requiresOtp) {
        const challengeState: OtpChallengeState = {
          email: data.data.email || credentials.email,
          challengeToken: data.data.challengeToken,
          type: 'LOGIN',
          cooldownSeconds: data.data.cooldownSeconds || 30,
        };
        setOtpChallenge(challengeState);
        setAuthModalView('otp');
        setIsAuthModalOpen(true);
        return {
          success: true,
          requiresOtp: true,
          challengeToken: data.data.challengeToken,
          email: data.data.email,
          message: data.data.message || 'Verification code dispatched to your email.',
        };
      }

      // Direct fallback (if session already verified)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('veloura_multi_step_checkout_state');
        localStorage.removeItem('veloura_checkout_state');
      }
      await refreshUser();
      closeAuthModal();
      return { success: true };
    } catch {
      return { success: false, message: 'Network error during sign in.' };
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.error?.message || 'Registration failed.',
        };
      }

      if (data.data?.requiresOtp) {
        const challengeState: OtpChallengeState = {
          email: data.data.email || userData.email,
          challengeToken: data.data.challengeToken,
          type: 'REGISTER',
          cooldownSeconds: data.data.cooldownSeconds || 30,
        };
        setOtpChallenge(challengeState);
        setAuthModalView('otp');
        setIsAuthModalOpen(true);
        return {
          success: true,
          requiresOtp: true,
          challengeToken: data.data.challengeToken,
          email: data.data.email,
          message: data.data.message || 'Account created. Verification code dispatched to your email.',
        };
      }

      return {
        success: true,
        message: 'Account created successfully. Please sign in.',
      };
    } catch {
      return { success: false, message: 'Network error during registration.' };
    }
  };

  const verifyOtp = async (params: { email: string; challengeToken: string; otp: string }) => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data: ApiResponse<AuthResponseData> = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.error?.message || 'Verification failed. Please check your code.',
        };
      }

      if (typeof window !== 'undefined') {
        localStorage.removeItem('veloura_multi_step_checkout_state');
        localStorage.removeItem('veloura_checkout_state');
      }

      await refreshUser();
      closeAuthModal();
      setOtpChallenge(null);
      return { success: true };
    } catch {
      return { success: false, message: 'Network error during verification.' };
    }
  };

  const resendOtp = async (params: { email: string; challengeToken: string }) => {
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.error?.message || 'Failed to resend verification code.',
        };
      }

      if (data.data?.challengeToken) {
        setOtpChallenge((prev) =>
          prev ? { ...prev, challengeToken: data.data.challengeToken } : null
        );
      }

      return {
        success: true,
        message: data.data?.message || 'New verification code dispatched to your email.',
        cooldownSeconds: data.data?.cooldownSeconds || 30,
      };
    } catch {
      return { success: false, message: 'Network error during resend.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      setProfile(null);
      setAddresses([]);
      setPermissions([]);
      setOtpChallenge(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('veloura_cart');
        localStorage.removeItem('veloura_wishlist');
        localStorage.removeItem('veloura_orders');
        localStorage.removeItem('veloura_multi_step_checkout_state');
        localStorage.removeItem('veloura_checkout_state');
        window.location.href = '/';
      }
    }
  };

  const updateProfile = async (profileData: Partial<DbProfile>): Promise<boolean> => {
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      const json: ApiResponse<DbProfile> = await res.json();
      if (json.success && json.data) {
        setProfile(json.data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const addAddress = async (addressData: any): Promise<DbAddress | null> => {
    try {
      const res = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressData),
      });
      const json: ApiResponse<DbAddress> = await res.json();
      if (json.success && json.data) {
        await refreshUser();
        return json.data;
      }
      return null;
    } catch {
      return null;
    }
  };

  const removeAddress = async (addressId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/user/addresses/${addressId}`, { method: 'DELETE' });
      const json: ApiResponse<any> = await res.json();
      if (json.success) {
        setAddresses((prev) => prev.filter((a) => a.id !== addressId));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.roles?.includes('ADMIN') || false;
  const isManager = user?.roles?.includes('MANAGER') || user?.roles?.includes('ADMIN') || false;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        addresses,
        permissions,
        isLoading,
        isAuthenticated,
        isAdmin,
        isManager,
        isAuthModalOpen,
        authModalView,
        otpChallenge,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        verifyOtp,
        resendOtp,
        logout,
        refreshUser,
        updateProfile,
        addAddress,
        removeAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
