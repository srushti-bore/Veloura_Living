'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useStore } from '@/hooks/useStore';
import { useAuth } from '@/providers/AuthProvider';
import { useCurrency } from '@/providers/CurrencyProvider';

export interface CheckoutIdentityState {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  keepUpdated: boolean;
  isGuest: boolean;
  notificationChannel: 'whatsapp' | 'sms' | 'email';
}

export interface CheckoutDeliveryState {
  address: string;
  apartment: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  deliveryNotes: string;
}

export interface CheckoutAtelierState {
  deliveryMethod: 'standard' | 'white_glove' | 'express';
  additionalServices: string[];
  stagingSlot: 'morning' | 'afternoon' | 'weekend_vip';
  roomPlacement: 'living_room' | 'master_suite' | 'dining_salon' | 'executive_office';
  elevatorAccess: 'service_elevator' | 'ground_floor' | 'staircase_carriage';
  ecoDebrisRemoval: boolean;
  specialInstructions: string;
}

export interface CheckoutReviewState {
  giftNote: string;
  agreeToTerms: boolean;
}

export interface CheckoutPaymentState {
  paymentMethod: 'upi_razorpay' | 'credit_card' | 'cod' | 'international_card' | 'netbanking' | 'emi';
  selectedBank: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
}

export interface CheckoutContextType {
  identity: CheckoutIdentityState;
  delivery: CheckoutDeliveryState;
  atelier: CheckoutAtelierState;
  review: CheckoutReviewState;
  payment: CheckoutPaymentState;
  completedSteps: { 1: boolean; 2: boolean; 3: boolean; 4: boolean; 5: boolean };
  updateIdentity: (data: Partial<CheckoutIdentityState>) => void;
  updateDelivery: (data: Partial<CheckoutDeliveryState>) => void;
  updateAtelier: (data: Partial<CheckoutAtelierState>) => void;
  updateReview: (data: Partial<CheckoutReviewState>) => void;
  updatePayment: (data: Partial<CheckoutPaymentState>) => void;
  markStepCompleted: (step: 1 | 2 | 3 | 4 | 5) => void;
  isStepAccessible: (step: 1 | 2 | 3 | 4 | 5) => boolean;
  validateIdentity: () => { isValid: boolean; error?: string };
  validateDelivery: () => { isValid: boolean; error?: string };
  validateAtelier: () => { isValid: boolean; error?: string };
  validateReview: () => { isValid: boolean; error?: string };
  createdOrderNumber: string | null;
  setCreatedOrderNumber: (orderNum: string | null) => void;
  paymentTxnRef: string | null;
  setPaymentTxnRef: (ref: string | null) => void;
  isCodVerified: boolean;
  setIsCodVerified: (verified: boolean) => void;
  codVerificationId: string | null;
  setCodVerificationId: (id: string | null) => void;
  resetCheckout: () => void;
}

const DEFAULT_IDENTITY: CheckoutIdentityState = {
  firstName: 'Aarav',
  lastName: 'Singhania',
  fullName: 'Aarav Singhania',
  email: 'aarav.singhania@veloura.live',
  phone: '+91 98201 54321',
  keepUpdated: true,
  isGuest: false,
  notificationChannel: 'whatsapp',
};

const DEFAULT_DELIVERY: CheckoutDeliveryState = {
  address: 'Skyline Penthouse 34A, Worli Sea Face',
  apartment: 'Tower B, 34th Floor',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400018',
  country: 'India',
  deliveryNotes: 'Please coordinate with tower concierge for priority elevator access.',
};

const DEFAULT_ATELIER: CheckoutAtelierState = {
  deliveryMethod: 'white_glove',
  additionalServices: ['Professional Assembly', 'Installation Support'],
  stagingSlot: 'morning',
  roomPlacement: 'living_room',
  elevatorAccess: 'service_elevator',
  ecoDebrisRemoval: true,
  specialInstructions: 'White-glove team to assemble and place modular sofa and verify joinery alignment.',
};

const DEFAULT_REVIEW: CheckoutReviewState = {
  giftNote: '',
  agreeToTerms: true,
};

const DEFAULT_PAYMENT: CheckoutPaymentState = {
  paymentMethod: 'upi_razorpay',
  selectedBank: 'HDFC',
  cardNumber: '4532 •••• •••• 8921',
  cardExpiry: '08/29',
  cardCvv: '•••',
};

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

const STORAGE_KEY = 'veloura_multi_step_checkout_state';

export const CheckoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, addresses } = useAuth();

  const [identity, setIdentity] = useState<CheckoutIdentityState>(DEFAULT_IDENTITY);
  const [delivery, setDelivery] = useState<CheckoutDeliveryState>(DEFAULT_DELIVERY);
  const [atelier, setAtelier] = useState<CheckoutAtelierState>(DEFAULT_ATELIER);
  const [review, setReview] = useState<CheckoutReviewState>(DEFAULT_REVIEW);
  const [payment, setPayment] = useState<CheckoutPaymentState>(DEFAULT_PAYMENT);

  const [completedSteps, setCompletedSteps] = useState<{ 1: boolean; 2: boolean; 3: boolean; 4: boolean; 5: boolean }>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: false,
  });

  const [createdOrderNumber, setCreatedOrderNumber] = useState<string | null>(null);
  const [paymentTxnRef, setPaymentTxnRef] = useState<string | null>(null);
  const [isCodVerified, setIsCodVerified] = useState<boolean>(false);
  const [codVerificationId, setCodVerificationId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.identity) {
          setIdentity((prev) => ({
            ...DEFAULT_IDENTITY,
            ...parsed.identity,
            firstName: parsed.identity.firstName || parsed.identity.fullName?.split(' ')[0] || DEFAULT_IDENTITY.firstName,
            lastName: parsed.identity.lastName || parsed.identity.fullName?.split(' ').slice(1).join(' ') || DEFAULT_IDENTITY.lastName,
            keepUpdated: parsed.identity.keepUpdated ?? DEFAULT_IDENTITY.keepUpdated,
            isGuest: parsed.identity.isGuest ?? DEFAULT_IDENTITY.isGuest,
          }));
        }
        if (parsed.delivery) {
          setDelivery((prev) => ({ ...DEFAULT_DELIVERY, ...parsed.delivery }));
        }
        if (parsed.atelier) {
          setAtelier((prev) => ({
            ...DEFAULT_ATELIER,
            ...parsed.atelier,
            additionalServices: parsed.atelier.additionalServices || DEFAULT_ATELIER.additionalServices,
            deliveryMethod: parsed.atelier.deliveryMethod || DEFAULT_ATELIER.deliveryMethod,
          }));
        }
        if (parsed.review) {
          setReview((prev) => ({ ...DEFAULT_REVIEW, ...parsed.review }));
        }
        if (parsed.payment) {
          setPayment((prev) => ({ ...DEFAULT_PAYMENT, ...parsed.payment }));
        }
        if (parsed.completedSteps) setCompletedSteps(parsed.completedSteps);
        if (parsed.createdOrderNumber) setCreatedOrderNumber(parsed.createdOrderNumber);
        if (parsed.paymentTxnRef) setPaymentTxnRef(parsed.paymentTxnRef);
      }
    } catch (e) {
      console.warn('Checkout state hydration error:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Pre-fill user information if authenticated and not already customized
  useEffect(() => {
    if (user && !localStorage.getItem(STORAGE_KEY)) {
      const fName = profile?.first_name || user.profile?.firstName || 'Aarav';
      const lName = profile?.last_name || user.profile?.lastName || 'Singhania';
      const uPhone = profile?.phone || '+91 98201 54321';

      setIdentity((prev) => ({
        ...prev,
        fullName: `${fName} ${lName}`.trim(),
        firstName: fName,
        lastName: lName,
        email: user.email || prev.email,
        phone: uPhone,
      }));

      if (addresses && addresses.length > 0) {
        const def = addresses.find((a) => a.is_default_shipping) || addresses[0];
        if (def) {
          setDelivery((prev) => ({
            ...prev,
            address: def.address_line1 || prev.address,
            apartment: def.address_line2 || prev.apartment,
            city: def.city || prev.city,
            state: def.state || prev.state,
            pincode: def.postal_code || prev.pincode,
            country: def.country || prev.country,
          }));
        }
      }
    }
  }, [user, profile, addresses]);

  // Persist state changes to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          identity,
          delivery,
          atelier,
          review,
          payment,
          completedSteps,
          createdOrderNumber,
          paymentTxnRef,
        })
      );
    } catch (e) {
      console.warn('Failed to persist checkout state:', e);
    }
  }, [identity, delivery, atelier, review, payment, completedSteps, createdOrderNumber, paymentTxnRef, isLoaded]);

  const updateIdentity = useCallback((data: Partial<CheckoutIdentityState>) => {
    setIdentity((prev) => {
      const next = { ...prev, ...data };
      if (data.firstName || data.lastName) {
        next.fullName = `${next.firstName} ${next.lastName}`.trim();
      }
      return next;
    });
  }, []);

  const updateDelivery = useCallback((data: Partial<CheckoutDeliveryState>) => {
    setDelivery((prev) => ({ ...prev, ...data }));
  }, []);

  const updateAtelier = useCallback((data: Partial<CheckoutAtelierState>) => {
    setAtelier((prev) => ({ ...prev, ...data }));
  }, []);

  const updateReview = useCallback((data: Partial<CheckoutReviewState>) => {
    setReview((prev) => ({ ...prev, ...data }));
  }, []);

  const updatePayment = useCallback((data: Partial<CheckoutPaymentState>) => {
    setPayment((prev) => ({ ...prev, ...data }));
  }, []);

  const markStepCompleted = useCallback((step: 1 | 2 | 3 | 4 | 5) => {
    setCompletedSteps((prev) => ({ ...prev, [step]: true }));
  }, []);

  const validateIdentity = useCallback(() => {
    if (!identity.fullName.trim() && (!identity.firstName.trim() || !identity.lastName.trim())) {
      return { isValid: false, error: 'Please enter your full legal name.' };
    }
    if (!identity.email.trim() || !identity.email.includes('@')) {
      return { isValid: false, error: 'Please enter a valid email address for order tracking.' };
    }
    if (!identity.phone.trim() || identity.phone.length < 8) {
      return { isValid: false, error: 'Please enter a valid mobile contact number.' };
    }
    return { isValid: true };
  }, [identity]);

  const validateDelivery = useCallback(() => {
    if (!delivery.address.trim()) {
      return { isValid: false, error: 'Please enter your street address and building.' };
    }
    if (!delivery.city.trim()) {
      return { isValid: false, error: 'Please enter your city.' };
    }
    if (!delivery.state.trim()) {
      return { isValid: false, error: 'Please enter your state.' };
    }
    if (!delivery.pincode.trim() || delivery.pincode.length < 4) {
      return { isValid: false, error: 'Please enter a valid PIN / Postal code.' };
    }
    return { isValid: true };
  }, [delivery]);

  const validateAtelier = useCallback(() => {
    if (!atelier.stagingSlot) {
      return { isValid: false, error: 'Please select an installation time slot.' };
    }
    if (!atelier.roomPlacement) {
      return { isValid: false, error: 'Please select your target placement room.' };
    }
    return { isValid: true };
  }, [atelier]);

  const validateReview = useCallback(() => {
    return { isValid: true };
  }, []);

  const isStepAccessible = useCallback(
    (step: 1 | 2 | 3 | 4 | 5) => {
      if (step === 1) return true;
      if (step === 2) return completedSteps[1];
      if (step === 3) return completedSteps[1] && completedSteps[2];
      if (step === 4) return completedSteps[1] && completedSteps[2] && completedSteps[3];
      if (step === 5) return completedSteps[1] && completedSteps[2] && completedSteps[3] && completedSteps[4];
      return false;
    },
    [completedSteps]
  );

  const resetCheckout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setIdentity(DEFAULT_IDENTITY);
    setDelivery(DEFAULT_DELIVERY);
    setAtelier(DEFAULT_ATELIER);
    setReview(DEFAULT_REVIEW);
    setPayment(DEFAULT_PAYMENT);
    setCompletedSteps({ 1: true, 2: true, 3: true, 4: true, 5: false });
    setCreatedOrderNumber(null);
    setPaymentTxnRef(null);
    setIsCodVerified(false);
    setCodVerificationId(null);
  }, []);

  return (
    <CheckoutContext.Provider
      value={{
        identity,
        delivery,
        atelier,
        review,
        payment,
        completedSteps,
        updateIdentity,
        updateDelivery,
        updateAtelier,
        updateReview,
        updatePayment,
        markStepCompleted,
        isStepAccessible,
        validateIdentity,
        validateDelivery,
        validateAtelier,
        validateReview,
        createdOrderNumber,
        setCreatedOrderNumber,
        paymentTxnRef,
        setPaymentTxnRef,
        isCodVerified,
        setIsCodVerified,
        codVerificationId,
        setCodVerificationId,
        resetCheckout,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = (): CheckoutContextType => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};
