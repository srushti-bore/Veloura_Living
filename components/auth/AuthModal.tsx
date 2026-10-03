'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { X, Lock, Mail, User, Phone, ArrowRight, ShieldCheck, Sparkles, Key } from 'lucide-react';

export function AuthModal() {
  const { isAuthModalOpen, authModalView, closeAuthModal, openAuthModal, login, register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetTokenInfo, setResetTokenInfo] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const res = await login({ email, password });
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.message || 'Invalid credentials');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const res = await register({ email, password, firstName, lastName, phone });
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.message || 'Registration failed');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        setResetSent(true);
        if (data.data?.demoToken) {
          setResetTokenInfo(data.data.demoToken);
        }
      } else {
        setErrorMessage(data.error?.message || 'Password reset request failed.');
      }
    } catch {
      setLoading(false);
      setErrorMessage('Network error occurred.');
    }
  };

  const autofillDemo = (role: 'admin' | 'concierge' | 'client') => {
    if (role === 'admin') {
      setEmail('admin@velouraliving.com');
      setPassword('VelouraAdmin2026!');
    } else if (role === 'concierge') {
      setEmail('concierge@velouraliving.com');
      setPassword('VelouraAdmin2026!');
    } else {
      setEmail('client@example.com');
      setPassword('VelouraAdmin2026!');
    }
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-espresso/60 backdrop-blur-md animate-fade-in">
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-md bg-ivory rounded-2xl shadow-2xl border border-walnut/15 overflow-hidden transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-espresso via-deep-walnut to-espresso px-6 py-4 text-ivory flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl tracking-wider font-medium text-sand">VELOURA</span>
            <span className="text-xs uppercase tracking-widest text-ivory/60 border-l border-ivory/20 pl-2">
              Concierge Access
            </span>
          </div>
          <button
            onClick={closeAuthModal}
            className="text-ivory/70 hover:text-sand transition-colors p-1 rounded-full hover:bg-ivory/10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-walnut/10 bg-cream/40">
          <button
            onClick={() => {
              openAuthModal('signin');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-3 text-xs uppercase tracking-widest font-medium transition-colors ${
              authModalView === 'signin'
                ? 'text-espresso border-b-2 border-caramel bg-ivory font-semibold'
                : 'text-taupe hover:text-espresso'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              openAuthModal('signup');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-3 text-xs uppercase tracking-widest font-medium transition-colors ${
              authModalView === 'signup'
                ? 'text-espresso border-b-2 border-caramel bg-ivory font-semibold'
                : 'text-taupe hover:text-espresso'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Messages */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              {successMessage}
            </div>
          )}

          {/* VIEW 1: SIGN IN */}
          {authModalView === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-charcoal/80 mb-1 font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-taupe" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@velouraliving.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-cream/30 border border-walnut/20 rounded-lg text-sm text-espresso focus:outline-none focus:border-caramel focus:ring-1 focus:ring-caramel transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs uppercase tracking-wider text-charcoal/80 font-medium">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => openAuthModal('forgot')}
                    className="text-xs text-caramel hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-taupe" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-cream/30 border border-walnut/20 rounded-lg text-sm text-espresso focus:outline-none focus:border-caramel focus:ring-1 focus:ring-caramel transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-espresso hover:bg-deep-walnut text-ivory rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In to Concierge'}
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Demo Accounts Quick-Picker */}
              <div className="pt-4 border-t border-walnut/10">
                <div className="text-[11px] uppercase tracking-wider text-taupe font-medium mb-2 flex items-center gap-1.5">
                  <Key className="w-3 h-3 text-caramel" /> Quick 1-Tap Demo Credentials:
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => autofillDemo('admin')}
                    className="py-1.5 px-2 bg-cream/60 hover:bg-cream text-[11px] rounded border border-walnut/15 text-espresso font-medium text-center transition-colors"
                  >
                    👑 Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => autofillDemo('concierge')}
                    className="py-1.5 px-2 bg-cream/60 hover:bg-cream text-[11px] rounded border border-walnut/15 text-espresso font-medium text-center transition-colors"
                  >
                    🛎️ Concierge
                  </button>
                  <button
                    type="button"
                    onClick={() => autofillDemo('client')}
                    className="py-1.5 px-2 bg-cream/60 hover:bg-cream text-[11px] rounded border border-walnut/15 text-espresso font-medium text-center transition-colors"
                  >
                    🏛️ Client
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* VIEW 2: CREATE ACCOUNT */}
          {authModalView === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-charcoal/80 mb-1 font-medium">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-taupe" />
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Eleanor"
                      className="w-full pl-9 pr-3 py-2 bg-cream/30 border border-walnut/20 rounded-lg text-sm text-espresso focus:outline-none focus:border-caramel"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-charcoal/80 mb-1 font-medium">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Vance"
                    className="w-full px-3 py-2 bg-cream/30 border border-walnut/20 rounded-lg text-sm text-espresso focus:outline-none focus:border-caramel"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-charcoal/80 mb-1 font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-taupe" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="eleanor@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-cream/30 border border-walnut/20 rounded-lg text-sm text-espresso focus:outline-none focus:border-caramel"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-charcoal/80 mb-1 font-medium">
                  Phone (for Delivery Concierge)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-taupe" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98200 00000"
                    className="w-full pl-9 pr-3 py-2 bg-cream/30 border border-walnut/20 rounded-lg text-sm text-espresso focus:outline-none focus:border-caramel"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-charcoal/80 mb-1 font-medium">
                  Password (min 8 characters)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-taupe" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-cream/30 border border-walnut/20 rounded-lg text-sm text-espresso focus:outline-none focus:border-caramel"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-espresso hover:bg-deep-walnut text-ivory rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? 'Creating Profile...' : 'Register Concierge Profile'}
                <Sparkles className="w-4 h-4 text-sand" />
              </button>
            </form>
          )}

          {/* VIEW 3: FORGOT PASSWORD */}
          {authModalView === 'forgot' && (
            <div className="space-y-4">
              {resetSent ? (
                <div className="text-center py-4 space-y-3">
                  <ShieldCheck className="w-12 h-12 text-caramel mx-auto" />
                  <h4 className="font-serif text-lg text-espresso">Reset Instructions Dispatched</h4>
                  <p className="text-xs text-taupe leading-relaxed">
                    We have dispatched password recovery instructions to <strong>{email}</strong>.
                  </p>
                  {resetTokenInfo && (
                    <div className="p-2 bg-cream/80 border border-walnut/20 rounded text-[11px] text-espresso font-mono text-left break-all">
                      Demo Reset Token: {resetTokenInfo}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setResetSent(false);
                      openAuthModal('signin');
                    }}
                    className="text-xs text-caramel hover:underline font-medium pt-2 block mx-auto"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <p className="text-xs text-taupe leading-relaxed">
                    Enter your registered email address to receive secure instructions to reset your concierge password.
                  </p>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-charcoal/80 mb-1 font-medium">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-taupe" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="client@velouraliving.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-cream/30 border border-walnut/20 rounded-lg text-sm text-espresso focus:outline-none focus:border-caramel"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-espresso hover:bg-deep-walnut text-ivory rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuthModal('signin')}
                    className="w-full text-center text-xs text-taupe hover:text-espresso"
                  >
                    Back to Sign In
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
