'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import { useCurrency } from '@/providers/CurrencyProvider';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  QrCode,
  Banknote,
  Globe,
  Check,
  AlertCircle,
  Zap,
  Landmark,
  User,
  MapPin,
  ClipboardCheck,
  Edit3,
  Building2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CheckoutPage: React.FC = () => {
  const { cart, cartSubtotal, discountAmount, shippingCost, cartTotal, createOrder, navigate } = useStore();
  const { formatPrice, currentCurrency, currencyConfig } = useCurrency();

  // Multi-step checkout state: 1 (Identity) -> 2 (Address) -> 3 (Confirmation) -> 4 (Payment)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  const [formData, setFormData] = useState({
    fullName: 'Aarav Singhania',
    email: 'aarav.singhania@veloura.live',
    phone: '+91 98201 54321',
    address: 'Skyline Penthouse 34A, Worli Sea Face',
    apartment: 'Tower B, 34th Floor',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400018',
    deliveryNotes: 'Please coordinate with tower concierge for elevator priority access.',
    paymentMethod: 'upi_razorpay' as 'upi_razorpay' | 'credit_card' | 'cod' | 'international_card' | 'netbanking' | 'emi',
    cardNumber: '4532 •••• •••• 8921',
    cardExpiry: '08/29',
    cardCvv: '•••'
  });

  const [selectedBank, setSelectedBank] = useState<string>('HDFC');

  // Step Validation Errors
  const [stepError, setStepError] = useState<string | null>(null);

  // Razorpay Integration State
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentTxnRef, setPaymentTxnRef] = useState<string | null>(null);

  // COD Safety State
  const [codOtpSent, setCodOtpSent] = useState(false);
  const [codVerificationId, setCodVerificationId] = useState<string | null>(null);
  const [codOtpInput, setCodOtpInput] = useState('');
  const [isCodVerified, setIsCodVerified] = useState(false);
  const [codError, setCodError] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string | null>(null);

  // Load Razorpay Script dynamically
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setIsRazorpayLoaded(true);
      script.onerror = () => console.warn('Razorpay checkout script could not be loaded.');
      document.body.appendChild(script);
    } else if (typeof window !== 'undefined' && (window as any).Razorpay) {
      setIsRazorpayLoaded(true);
    }
  }, []);

  // Calculate COD handling fee
  const isCodEligible = cartTotal >= 2500 && cartTotal <= 150000;
  const codFee = formData.paymentMethod === 'cod' ? (cartTotal >= 50000 ? 0 : 750) : 0;
  const effectiveTotal = cartTotal + codFee;

  if (cart.length === 0 && !createdOrderNumber) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-display font-bold text-2xl text-[#4A2C1A] mb-2">
          Your cart is currently empty.
        </h2>
        <p className="text-xs text-[#746B61] mb-6">
          Explore our rooms or catalog to add handcrafted furniture.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="bg-[#4A2C1A] text-white px-6 py-3 rounded-full text-xs font-semibold hover:bg-[#8B5A2B] cursor-pointer"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  // Handle COD OTP dispatch
  const handleSendCodOtp = async () => {
    setIsSendingOtp(true);
    setCodError(null);
    try {
      const res = await fetch('/api/orders/cod-otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneOrEmail: formData.phone || formData.email,
          amountInINR: cartTotal,
          postalCode: formData.pincode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCodError(data.error?.message || 'Failed to dispatch verification code');
      } else {
        setCodOtpSent(true);
        setCodVerificationId(data.data.verificationId);
        if (data.data.debugCode) {
          setCodOtpInput(data.data.debugCode);
        }
      }
    } catch (err: any) {
      setCodError(err.message || 'Network error sending OTP');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle COD OTP Verification
  const handleVerifyCodOtp = async () => {
    if (!codVerificationId || !codOtpInput) return;
    try {
      const res = await fetch('/api/orders/cod-otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId: codVerificationId,
          otp: codOtpInput,
        }),
      });
      const data = await res.json();
      if (res.ok && data.data?.verified) {
        setIsCodVerified(true);
        setCodError(null);
      } else {
        setCodError(data.error?.message || 'Incorrect verification code entered.');
      }
    } catch (err: any) {
      setCodError(err.message || 'Error verifying code');
    }
  };

  // Execute Order Creation & Razorpay Verification Flow
  const finalizeOrder = async (paymentRef: string, gatewayDetails?: any) => {
    const order = createOrder({
      status: 'Processing',
      items: cart.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        name: item.product.name,
        image: item.product.images[0],
        selectedColor: item.selectedColor,
        selectedMaterial: item.selectedMaterial,
        price: item.price,
        quantity: item.quantity
      })),
      subtotal: cartSubtotal,
      discount: discountAmount,
      shipping: shippingCost,
      total: effectiveTotal,
      customer: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        apartment: formData.apartment,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode
      },
      estimatedDeliveryDate: '07 Oct 2026',
      paymentMethod: formData.paymentMethod,
      paymentStatus: formData.paymentMethod === 'cod' ? 'Pending' : 'Paid',
      currency: currentCurrency,
      codHandlingFee: codFee,
      codVerified: formData.paymentMethod === 'cod' ? true : undefined,
    });

    setPaymentTxnRef(paymentRef);
    setCreatedOrderNumber(order.orderNumber);
    setIsProcessingPayment(false);
    setIsSubmitting(false);

    // Celebration confetti
    try {
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleRazorpayGatewayCheckout = async () => {
    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      // 1. Create Authentic Razorpay Payment Order Intent
      const intentRes = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'temp_cart_' + Date.now(),
          amount: effectiveTotal,
          currency: 'INR',
          customerInfo: {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
          },
        }),
      });

      const intentData = await intentRes.json();
      if (!intentRes.ok || !intentData.success || !intentData.data?.gatewayOrderId) {
        throw new Error(intentData.error?.message || 'Failed to initialize Razorpay payment order.');
      }

      const gatewayOrderId = intentData.data.gatewayOrderId;
      const razorpayKey = intentData.data.keyId;

      // 2. Launch Official Razorpay Modal
      if (typeof window === 'undefined' || !(window as any).Razorpay) {
        throw new Error('Razorpay Checkout SDK is still loading. Please check your connection and retry.');
      }

      const options: any = {
        key: razorpayKey,
        amount: intentData.data.amountInPaise || Math.round(effectiveTotal * 100),
        currency: 'INR',
        name: 'Veloura Living',
        description: 'Luxury Curated Furniture Order',
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=100&auto=format&fit=crop&q=80',
        order_id: gatewayOrderId,
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#1C140E',
        },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: gatewayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id || gatewayOrderId,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              finalizeOrder(response.razorpay_payment_id, verifyData);
            } else {
              setIsProcessingPayment(false);
              setPaymentError(verifyData.error?.message || 'Payment signature verification failed. Order not confirmed.');
            }
          } catch (vErr: any) {
            setIsProcessingPayment(false);
            setPaymentError(vErr.message || 'Payment verification failed.');
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
            setPaymentError('Payment window closed. You can retry payment anytime.');
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        setIsProcessingPayment(false);
        setPaymentError(response.error?.description || response.error?.reason || 'Payment transaction failed. Please retry.');
      });
      rzp.open();
    } catch (err: any) {
      setIsProcessingPayment(false);
      setPaymentError(err.message || 'Payment initiation error.');
    }
  };

  // Step Navigations & Validations
  const goToStep2 = () => {
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setStepError('Please complete all client identification fields to proceed.');
      return;
    }
    setStepError(null);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToStep3 = () => {
    if (!formData.address.trim() || !formData.city.trim() || !formData.state.trim() || !formData.pincode.trim()) {
      setStepError('Please complete the full delivery address and pincode.');
      return;
    }
    setStepError(null);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToStep4 = () => {
    setStepError(null);
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.paymentMethod === 'cod') {
      if (!isCodVerified) {
        setCodError('Please complete mobile OTP verification before placing a Cash on Delivery order.');
        return;
      }
      setIsSubmitting(true);
      setTimeout(() => {
        finalizeOrder('COD_PENDING_DELIVERY');
      }, 1000);
      return;
    }

    handleRazorpayGatewayCheckout();
  };

  // Order Success Screen with 🪙 Gold Coins Reward
  if (createdOrderNumber) {
    const earnedGoldCoins = Math.max(250, Math.round(effectiveTotal * 0.02));

    return (
      <div className="min-h-screen bg-[#FCFAF7] py-16 flex items-center justify-center px-4">
        <div className="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-12 border border-[#4A2C1A]/10 shadow-2xl text-center space-y-6 animate-scaleUp">
          <div className="w-16 h-16 rounded-full bg-[#557A5A]/15 text-[#557A5A] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-[#8B5A2B]">
            Order Confirmed & Allocation Complete
          </span>

          <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#211E1B]">
            Thank you, {formData.fullName}.
          </h1>

          <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#D8B486]/30 text-xs text-left space-y-2">
            <div className="flex justify-between items-center text-[#4A2C1A]">
              <span className="font-semibold">Order Reference:</span>
              <span className="font-mono font-bold">{createdOrderNumber}</span>
            </div>
            <div className="flex justify-between items-center text-[#4A2C1A]">
              <span className="font-semibold">Delivery To:</span>
              <span className="text-[#211E1B]">{formData.city}, {formData.state} ({formData.pincode})</span>
            </div>
            <div className="flex justify-between items-center text-[#4A2C1A]">
              <span className="font-semibold">Payment Status:</span>
              <span className="font-bold text-[#557A5A] flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {formData.paymentMethod === 'cod' ? 'Cash on Delivery (Pending)' : 'Verified (Paid)'}
              </span>
            </div>
            {paymentTxnRef && (
              <div className="flex justify-between items-center text-[#746B61] pt-1 border-t border-[#8B5A2B]/20">
                <span>Transaction Ref:</span>
                <span className="font-mono text-[11px] text-[#4A2C1A]">{paymentTxnRef}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-[#4A2C1A] pt-1 border-t border-[#8B5A2B]/20">
              <span className="font-semibold">Total Amount:</span>
              <span className="font-bold text-sm text-[#8B5A2B]">{formatPrice(effectiveTotal)}</span>
            </div>
          </div>

          {/* Privilege Gold Coins Reward Card */}
          <div className="p-4 bg-gradient-to-r from-[#211E1B] via-[#332A22] to-[#211E1B] text-white rounded-2xl border border-[#D8B486]/40 shadow-lg text-left flex items-center justify-between gap-4 relative overflow-hidden">
            <div className="flex items-center gap-3.5 z-10">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#B3874B] via-[#F3E5AB] to-[#D8B486] flex items-center justify-center text-[#211E1B] shadow-md animate-bounce">
                <span className="text-2xl select-none">🪙</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#F3E5AB]">
                  <Sparkles className="w-3.5 h-3.5 text-[#F3E5AB]" />
                  <span>+{earnedGoldCoins.toLocaleString('en-IN')} Veloura Gold Coins Earned</span>
                </div>
                <p className="text-[11px] text-[#DED7CD] mt-0.5">
                  Credited to your Luxury Vault for upcoming bespoke reservations & private showcases.
                </p>
              </div>
            </div>
            <div className="hidden sm:block text-right z-10">
              <span className="text-[10px] uppercase font-mono tracking-wider px-2.5 py-1 bg-[#D8B486]/20 border border-[#D8B486]/40 rounded-full text-[#F3E5AB] font-bold">
                VIP Tier 1
              </span>
            </div>
          </div>

          <p className="text-xs text-[#746B61] leading-relaxed">
            Your bespoke luxury furniture order has been securely transmitted to our master atelier in Jodhpur. You will receive real-time SMS & email dispatch notifications.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/account')}
              className="bg-[#4A2C1A] text-white px-8 py-3.5 rounded-full text-xs font-semibold hover:bg-[#8B5A2B] transition-all cursor-pointer shadow-md"
            >
              View Order Tracking
            </button>
            <button
              onClick={() => navigate('/shop')}
              className="border border-[#4A2C1A]/30 text-[#4A2C1A] px-8 py-3.5 rounded-full text-xs font-semibold hover:bg-[#FCFAF7] transition-all cursor-pointer"
            >
              Continue Exploring
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Stepper Header Configuration
  const stepsConfig = [
    { num: 1, label: 'Client Identity', icon: User },
    { num: 2, label: 'Delivery Address', icon: MapPin },
    { num: 3, label: 'Order Summary', icon: ClipboardCheck },
    { num: 4, label: 'Payment Gateway', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-[#FCFAF7] py-10 sm:py-16">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#EEE9E1]">
          <button
            onClick={() => {
              if (currentStep > 1) {
                setCurrentStep((prev) => (prev - 1) as any);
                setStepError(null);
              } else {
                navigate('/shop');
              }
            }}
            className="flex items-center gap-2 text-xs font-semibold text-[#8B5A2B] hover:text-[#4A2C1A] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{currentStep > 1 ? 'Back to Previous Step' : 'Return to Catalog'}</span>
          </button>
          <span className="text-xs uppercase tracking-widest text-[#9C9287] font-semibold">
            Bespoke White-Glove Staging & Checkout
          </span>
        </div>

        {/* 🌟 4-STEP LUXURY PROGRESS STEPPER */}
        <div className="mb-10 bg-white rounded-3xl p-4 sm:p-6 border border-[#4A2C1A]/10 shadow-soft-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative">
            {stepsConfig.map((s) => {
              const Icon = s.icon;
              const isCompleted = currentStep > s.num;
              const isActive = currentStep === s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => {
                    if (s.num < currentStep) setCurrentStep(s.num as any);
                  }}
                  disabled={s.num > currentStep}
                  className={`flex items-center gap-3 p-3 rounded-2xl transition-all text-left ${
                    isActive
                      ? 'bg-[#1C140E] text-[#F3E5AB] shadow-md ring-2 ring-[#D8B486]/50'
                      : isCompleted
                      ? 'bg-[#FAF7F2] text-[#4A2C1A] cursor-pointer hover:bg-[#F5E6D3]/40'
                      : 'bg-[#FCFAF7] text-[#9C9287] opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      isActive
                        ? 'bg-[#D8B486] text-[#1C140E]'
                        : isCompleted
                        ? 'bg-[#557A5A] text-white'
                        : 'bg-[#EEE9E1] text-[#746B61]'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase font-mono tracking-wider opacity-75">
                      Step 0{s.num}
                    </div>
                    <div className="text-xs font-bold truncate">{s.label}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Global Step Validation Notice */}
        {stepError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{stepError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* ================= LEFT COLUMN: STEP CONTENT (7 Cols) ================= */}
          <div className="lg:col-span-7 space-y-6">

            {/* ---------------- STEP 1: CLIENT IDENTIFICATION ---------------- */}
            {currentStep === 1 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4A2C1A]/10 shadow-soft-sm space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-[#EEE9E1] pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#8B5A2B] font-bold">Step 1 of 4</span>
                    <h2 className="font-display font-bold text-xl text-[#4A2C1A]">Client Identification</h2>
                  </div>
                  <User className="w-6 h-6 text-[#8B5A2B]" />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-[#514A43] block mb-1">
                      Full Legal Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Singhania"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-[#FCFAF7] border border-[#DED7CD] rounded-xl px-4 py-3 text-xs text-[#211E1B] focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-[#514A43] block mb-1">
                        Email for Delivery Tracking <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="aarav@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-[#FCFAF7] border border-[#DED7CD] rounded-xl px-4 py-3 text-xs text-[#211E1B] focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#514A43] block mb-1">
                        Mobile Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98201 54321"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-[#FCFAF7] border border-[#DED7CD] rounded-xl px-4 py-3 text-xs text-[#211E1B] focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={goToStep2}
                    className="px-8 py-3.5 bg-[#1C140E] hover:bg-[#8B5A2B] text-white rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <span>Proceed to Delivery Address</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ---------------- STEP 2: DELIVERY ADDRESS ---------------- */}
            {currentStep === 2 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4A2C1A]/10 shadow-soft-sm space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-[#EEE9E1] pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#8B5A2B] font-bold">Step 2 of 4</span>
                    <h2 className="font-display font-bold text-xl text-[#4A2C1A]">White-Glove Delivery Destination</h2>
                  </div>
                  <Truck className="w-6 h-6 text-[#8B5A2B]" />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-[#514A43] block mb-1">
                      Street Address & Building <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Skyline Penthouse 34A, Worli Sea Face"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-[#FCFAF7] border border-[#DED7CD] rounded-xl px-4 py-3 text-xs text-[#211E1B] focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#514A43] block mb-1">
                      Apartment / Suite / Floor (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tower B, 34th Floor"
                      value={formData.apartment}
                      onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                      className="w-full bg-[#FCFAF7] border border-[#DED7CD] rounded-xl px-4 py-3 text-xs text-[#211E1B] focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-[#514A43] block mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full bg-[#FCFAF7] border border-[#DED7CD] rounded-xl px-3 py-2.5 text-xs text-[#211E1B] focus:outline-none focus:border-[#8B5A2B]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#514A43] block mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full bg-[#FCFAF7] border border-[#DED7CD] rounded-xl px-3 py-2.5 text-xs text-[#211E1B] focus:outline-none focus:border-[#8B5A2B]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#514A43] block mb-1">
                        Pincode <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        className="w-full bg-[#FCFAF7] border border-[#DED7CD] rounded-xl px-3 py-2.5 text-xs text-[#211E1B] focus:outline-none focus:border-[#8B5A2B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#514A43] block mb-1">
                      White-Glove Staging & Delivery Instructions
                    </label>
                    <textarea
                      rows={2}
                      value={formData.deliveryNotes}
                      onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
                      className="w-full bg-[#FCFAF7] border border-[#DED7CD] rounded-xl px-3 py-2 text-xs text-[#211E1B] focus:outline-none focus:border-[#8B5A2B]"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3 border border-[#4A2C1A]/20 text-[#4A2C1A] rounded-full font-semibold text-xs hover:bg-[#FCFAF7] cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={goToStep3}
                    className="px-8 py-3.5 bg-[#1C140E] hover:bg-[#8B5A2B] text-white rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <span>Proceed to Order Review</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ---------------- STEP 3: ORDER REVIEW & SPECIFICATIONS ---------------- */}
            {currentStep === 3 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4A2C1A]/10 shadow-soft-sm space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-[#EEE9E1] pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#8B5A2B] font-bold">Step 3 of 4</span>
                    <h2 className="font-display font-bold text-xl text-[#4A2C1A]">Order & Staging Review</h2>
                  </div>
                  <ClipboardCheck className="w-6 h-6 text-[#8B5A2B]" />
                </div>

                {/* Client & Address Confirmation Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#D8B486]/30 text-xs space-y-1 relative">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="absolute top-3 right-3 text-[#8B5A2B] hover:text-[#4A2C1A] flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <span className="font-bold text-[#4A2C1A] block">Client Contact</span>
                    <p className="font-semibold text-[#211E1B]">{formData.fullName}</p>
                    <p className="text-[#746B61]">{formData.email}</p>
                    <p className="text-[#746B61]">{formData.phone}</p>
                  </div>

                  <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#D8B486]/30 text-xs space-y-1 relative">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="absolute top-3 right-3 text-[#8B5A2B] hover:text-[#4A2C1A] flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <span className="font-bold text-[#4A2C1A] block">Delivery Location</span>
                    <p className="text-[#211E1B]">{formData.address}</p>
                    <p className="text-[#746B61]">{formData.apartment}</p>
                    <p className="text-[#746B61]">{formData.city}, {formData.state} - {formData.pincode}</p>
                  </div>
                </div>

                {/* Itemized Pieces List */}
                <div>
                  <h4 className="text-xs font-bold text-[#4A2C1A] uppercase tracking-wider mb-3">
                    Curated Pieces ({cart.length} items)
                  </h4>
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-[#FCFAF7] rounded-2xl border border-[#EEE9E1]">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-14 h-14 object-cover rounded-xl border border-[#EEE9E1]"
                          />
                          <div>
                            <div className="font-semibold text-xs text-[#211E1B]">{item.product.name}</div>
                            <div className="text-[11px] text-[#8B5A2B]">
                              Finish: {item.selectedColor} • {item.selectedMaterial}
                            </div>
                            <div className="text-[10px] text-[#9C9287]">
                              Qty: {item.quantity} • Estimated Atelier Staging: 5-7 Days
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-xs text-[#4A2C1A]">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3 border border-[#4A2C1A]/20 text-[#4A2C1A] rounded-full font-semibold text-xs hover:bg-[#FCFAF7] cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={goToStep4}
                    className="px-8 py-3.5 bg-[#1C140E] hover:bg-[#8B5A2B] text-white rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <span>Proceed to Payment Engine</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ---------------- STEP 4: PAYMENT ENGINE & GATEWAY ---------------- */}
            {currentStep === 4 && (
              <form onSubmit={handleSubmitOrder} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4A2C1A]/10 shadow-soft-sm space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-[#EEE9E1] pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#8B5A2B] font-bold">Step 4 of 4</span>
                    <h2 className="font-display font-bold text-xl text-[#4A2C1A]">Payment Engine & Authorization</h2>
                  </div>
                  <span className="text-[11px] text-[#557A5A] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    256-Bit Razorpay Protected
                  </span>
                </div>

                {/* Payment Methods Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {[
                    { id: 'upi_razorpay', label: 'UPI / Razorpay', icon: QrCode },
                    { id: 'netbanking', label: 'Net Banking', icon: Landmark },
                    { id: 'credit_card', label: 'Credit Card', icon: CreditCard },
                    { id: 'cod', label: 'Cash on Delivery', icon: Banknote },
                    { id: 'international_card', label: 'Global Card', icon: Globe },
                    { id: 'emi', label: '0% EMI', icon: Sparkles }
                  ].map((pm) => {
                    const Icon = pm.icon;
                    const isSelected = formData.paymentMethod === pm.id;
                    return (
                      <button
                        type="button"
                        key={pm.id}
                        onClick={() => {
                          setFormData({ ...formData, paymentMethod: pm.id as any });
                          setCodError(null);
                          setPaymentError(null);
                        }}
                        className={`p-3 rounded-2xl border text-center transition-all duration-200 cursor-pointer flex flex-col items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#F5E6D3]/70 border-[#8B5A2B] ring-2 ring-[#8B5A2B]/30 text-[#4A2C1A] font-bold shadow-sm'
                            : 'bg-[#FCFAF7] border-[#EEE9E1] text-[#746B61] hover:bg-white hover:border-[#8B5A2B]/40'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-[#8B5A2B]" />
                        <span className="text-[10px] sm:text-[11px] font-medium">{pm.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* NetBanking Bank Selection Drawer */}
                {formData.paymentMethod === 'netbanking' && (
                  <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#D8B486]/40 text-xs space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#4A2C1A] flex items-center gap-1.5">
                        <Landmark className="w-3.5 h-3.5 text-[#8B5A2B]" />
                        <span>Select Your Bank for Direct NetBanking</span>
                      </span>
                      <span className="text-[10px] text-[#557A5A] font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Instant 256-Bit Bank Transfer
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { code: 'HDFC', name: 'HDFC Bank' },
                        { code: 'ICIC', name: 'ICICI Bank' },
                        { code: 'SBIN', name: 'State Bank of India' },
                        { code: 'UTIB', name: 'Axis Bank' },
                        { code: 'KKBK', name: 'Kotak Mahindra' },
                        { code: 'PUNB', name: 'Punjab National' }
                      ].map((bank) => (
                        <button
                          type="button"
                          key={bank.code}
                          onClick={() => setSelectedBank(bank.code)}
                          className={`px-3 py-2 rounded-xl text-left border text-xs transition-all flex items-center justify-between cursor-pointer ${
                            selectedBank === bank.code
                              ? 'bg-[#1C140E] text-[#F3E5AB] border-[#8B5A2B] font-bold shadow-sm'
                              : 'bg-white text-[#4A2C1A] border-[#DED7CD] hover:border-[#8B5A2B]'
                          }`}
                        >
                          <span className="truncate">{bank.name}</span>
                          {selectedBank === bank.code && <Check className="w-3.5 h-3.5 text-[#F3E5AB]" />}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2">
                      <label className="text-[11px] text-[#746B61] block mb-1 font-medium">Or choose from other Indian banks:</label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full bg-white border border-[#DED7CD] rounded-xl px-3 py-2 text-xs text-[#211E1B] focus:outline-none focus:border-[#8B5A2B]"
                      >
                        <option value="HDFC">HDFC Bank</option>
                        <option value="ICIC">ICICI Bank</option>
                        <option value="SBIN">State Bank of India</option>
                        <option value="UTIB">Axis Bank</option>
                        <option value="KKBK">Kotak Mahindra Bank</option>
                        <option value="YESB">Yes Bank</option>
                        <option value="BARB">Bank of Baroda</option>
                        <option value="INDB">IndusInd Bank</option>
                        <option value="FDRL">Federal Bank</option>
                        <option value="IDFB">IDFC FIRST Bank</option>
                        <option value="CNRB">Canara Bank</option>
                        <option value="UBIN">Union Bank of India</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Cash on Delivery (COD) OTP Verification */}
                {formData.paymentMethod === 'cod' && (
                  <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#D8B486]/40 text-xs space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#4A2C1A]">Cash on Delivery Phone Verification</span>
                      {codFee > 0 && <span className="text-[#8B5A2B] font-semibold">Handling Fee: {formatPrice(codFee)}</span>}
                    </div>

                    {!codOtpSent ? (
                      <div>
                        <p className="text-xs text-[#746B61] mb-3">
                          To protect against unauthorized orders, a 6-digit verification SMS OTP will be sent to <strong>{formData.phone}</strong>.
                        </p>
                        <button
                          type="button"
                          onClick={handleSendCodOtp}
                          disabled={isSendingOtp}
                          className="px-5 py-2.5 bg-[#4A2C1A] text-white rounded-full font-semibold hover:bg-[#8B5A2B] transition-all cursor-pointer text-xs"
                        >
                          {isSendingOtp ? 'Dispatching OTP...' : 'Send SMS Verification Code'}
                        </button>
                      </div>
                    ) : !isCodVerified ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="6-digit code"
                            value={codOtpInput}
                            onChange={(e) => setCodOtpInput(e.target.value)}
                            className="bg-white border border-[#DED7CD] rounded-xl px-3 py-2 text-sm font-mono tracking-widest text-[#211E1B] w-36 text-center"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyCodOtp}
                            className="px-4 py-2 bg-[#557A5A] text-white rounded-full font-semibold hover:bg-[#3D5740] cursor-pointer"
                          >
                            Verify
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-[#557A5A]/10 text-[#557A5A] rounded-xl flex items-center gap-2 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Phone verified. You can now place your COD order.</span>
                      </div>
                    )}

                    {codError && <p className="text-red-600 text-xs">{codError}</p>}
                  </div>
                )}

                {/* Razorpay Sandbox Testing Helper Guide Banner */}
                {formData.paymentMethod !== 'cod' && (
                  <div className="p-4 bg-[#1C140E] text-[#FAF7F2] rounded-2xl border border-[#D8B486]/30 text-xs space-y-2.5 animate-fadeIn shadow-inner">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[#D8B486] font-bold">
                        <Zap className="w-4 h-4 text-[#D8B486]" />
                        <span>Razorpay Sandbox Testing Engine Active</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D8B486]/20 text-[#D8B486] font-semibold uppercase tracking-wider">
                        Test Mode
                      </span>
                    </div>
                    <p className="text-[11px] text-[#E8D8C5]/90 leading-relaxed">
                      Clicking <strong>&quot;Pay with Razorpay&quot;</strong> will launch the verified payment checkout modal. In local testing, you can use:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[#3D271D]">
                      <div className="p-2 rounded-lg bg-[#2A1A12] border border-[#3D271D]">
                        <span className="text-[#D8B486] font-semibold block">💳 Test Card Number:</span>
                        <code className="font-mono text-[#FAF7F2]">4111 1111 1111 1111</code>
                        <span className="text-[#B9AA99] block text-[10px]">Exp: Any Future | CVV: 123 | OTP: 123456</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#2A1A12] border border-[#3D271D]">
                        <span className="text-[#D8B486] font-semibold block">📱 Test UPI ID:</span>
                        <code className="font-mono text-[#FAF7F2]">success@razorpay</code>
                        <span className="text-[#B9AA99] block text-[10px]">GPay, PhonePe, Paytm simulation</span>
                      </div>
                    </div>
                  </div>
                )}

                {paymentError && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>{paymentError}</span>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-3 border border-[#4A2C1A]/20 text-[#4A2C1A] rounded-full font-semibold text-xs hover:bg-[#FCFAF7] cursor-pointer"
                  >
                    Back to Review
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || isProcessingPayment || (formData.paymentMethod === 'cod' && !isCodVerified)}
                    className="px-8 py-4 rounded-full bg-[#1C140E] hover:bg-[#8B5A2B] text-white font-bold text-xs uppercase tracking-widest transition-all duration-200 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing with Razorpay...</span>
                      </>
                    ) : isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Confirming Order Allocation...</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {formData.paymentMethod === 'cod'
                            ? `Place COD Order (${formatPrice(effectiveTotal)})`
                            : `Pay ${formatPrice(effectiveTotal)} with Razorpay`}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>

          {/* ================= RIGHT COLUMN: STICKY ORDER SUMMARY (5 Cols) ================= */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4A2C1A]/10 shadow-soft-sm space-y-6 sticky top-24">
              <h3 className="font-display font-bold text-lg text-[#4A2C1A] border-b border-[#EEE9E1] pb-3">
                Order Summary ({cart.length} pieces)
              </h3>

              {/* Itemized List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs py-2 border-b border-[#FCFAF7]">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded-xl border border-[#EEE9E1]"
                      />
                      <div>
                        <div className="font-semibold text-[#211E1B]">{item.product.name}</div>
                        <div className="text-[11px] text-[#9C9287]">
                          Qty: {item.quantity} • {item.selectedColor}
                        </div>
                      </div>
                    </div>
                    <div className="font-mono font-semibold text-[#4A2C1A]">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation Breakdown */}
              <div className="space-y-2 pt-2 text-xs border-t border-[#EEE9E1]">
                <div className="flex justify-between text-[#746B61]">
                  <span>Subtotal</span>
                  <span className="font-mono font-medium">{formatPrice(cartSubtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#557A5A] font-semibold">
                    <span>Privilege Code Discount</span>
                    <span className="font-mono">- {formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#746B61]">
                  <span>White-Glove Domestic Assembly</span>
                  <span className="font-mono font-medium">
                    {shippingCost === 0 ? 'Complimentary' : formatPrice(shippingCost)}
                  </span>
                </div>
                {codFee > 0 && (
                  <div className="flex justify-between text-[#8B5A2B]">
                    <span>Cash on Delivery Handling</span>
                    <span className="font-mono font-medium">{formatPrice(codFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-[#211E1B] pt-3 border-t border-[#EEE9E1]">
                  <span>Total Payable ({currencyConfig.code})</span>
                  <span className="font-mono text-base text-[#8B5A2B]">{formatPrice(effectiveTotal)}</span>
                </div>
              </div>

              {/* Privilege Vault Gold Coins Estimator */}
              <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#D8B486]/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🪙</span>
                  <div>
                    <span className="font-bold text-[#4A2C1A] block text-[11px]">Vault Privilege Rewards</span>
                    <span className="text-[10px] text-[#746B61]">2% Luxury Gold Coins upon payment</span>
                  </div>
                </div>
                <span className="font-bold text-[#8B5A2B] text-xs">
                  +{Math.max(250, Math.round(effectiveTotal * 0.02)).toLocaleString('en-IN')} Coins
                </span>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[#9C9287]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#557A5A]" />
                <span>100% Buyer Protection & 10-Year Generational Warranty</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
