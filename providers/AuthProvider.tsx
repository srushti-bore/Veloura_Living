'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserSession, DbProfile, DbAddress, UserRoleEnum, ApiResponse, AuthResponseData } from '@/types';

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
  authModalView: 'signin' | 'signup' | 'forgot';
  openAuthModal: (view?: 'signin' | 'signup' | 'forgot') => void;
  closeAuthModal: () => void;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  register: (data: { email: string; password: string; firstName?: string; lastName?: string; phone?: string }) => Promise<{ success: boolean; message?: string }>;
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
  const [authModalView, setAuthModalView] = useState<'signin' | 'signup' | 'forgot'>('signin');

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

  const openAuthModal = useCallback((view: 'signin' | 'signup' | 'forgot' = 'signin') => {
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
      const data: ApiResponse<AuthResponseData> = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.error?.message || 'Login failed. Please verify credentials.',
        };
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
      const data: ApiResponse<AuthResponseData> = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.error?.message || 'Registration failed.',
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

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      setProfile(null);
      setAddresses([]);
      setPermissions([]);
      if (typeof window !== 'undefined') {
        window.location.reload();
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
        openAuthModal,
        closeAuthModal,
        login,
        register,
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
