'use client';

import React, { useState } from 'react';
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
  KeyRound,
  Check,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CheckoutPage: React.FC = () => {
  const { cart, cartSubtotal, discountAmount, shippingCost, cartTotal, createOrder, navigate } = useStore();
  const { formatPrice, currentCurrency, currencyConfig } = useCurrency();

  const [formData, setFormData] = useState({
    fullName: 'Aarav Singhania',
    email: 'aarav.singhania@veloura.live',
    phone: '+91 98201 54321',
    address: 'Skyline Penthouse 34A, Worli Sea Face',
    apartment: 'Tower B, 34th Floor',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400018',
    paymentMethod: 'upi_razorpay' as 'upi_razorpay' | 'credit_card' | 'cod' | 'international_card' | 'netbanking' | 'emi',
    cardNumber: '4532 •••• •••• 8921',
    cardExpiry: '08/29',
    cardCvv: '•••'
  });

  // COD Safety State
  const [codOtpSent, setCodOtpSent] = useState(false);
  const [codVerificationId, setCodVerificationId] = useState<string | null>(null);
  const [codOtpInput, setCodOtpInput] = useState('');
  const [isCodVerified, setIsCodVerified] = useState(false);
  const [codError, setCodError] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string | null>(null);

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
          setCodOtpInput(data.data.debugCode); // Pre-fill test code for swift testing
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

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    // Check COD verification requirement
    if (formData.paymentMethod === 'cod' && !isCodVerified) {
      setCodError('Please complete mobile OTP verification before placing a Cash on Delivery order.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
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

      setCreatedOrderNumber(order.orderNumber);
      setIsSubmitting(false);

      // Celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.log(err);
      }
    }, 1200);
  };

  // Order Success Screen
  if (createdOrderNumber) {
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

          <p className="text-xs sm:text-sm text-[#746B61] leading-relaxed">
            Your bespoke order <strong className="text-[#4A2C1A]">{createdOrderNumber}</strong> has been transmitted to our master atelier.
            {formData.paymentMethod === 'cod' ? (
              <span className="block mt-2 font-medium text-[#8B5A2B]">
                Payment Method: Cash on Delivery ({formatPrice(effectiveTotal)} to be collected upon White-Glove in-home assembly).
              </span>
            ) : (
              <span className="block mt-2 font-medium text-[#557A5A]">
                Payment verified ({formatPrice(effectiveTotal)} via {formData.paymentMethod.toUpperCase()}). Tax invoice generated.
              </span>
            )}
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

  return (
    <div className="min-h-screen bg-[#FCFAF7] py-10 sm:py-16">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#EEE9E1]">
          <button
            onClick={() => navigate('/shop')}
            className="flex items-center gap-2 text-xs font-semibold text-[#8B5A2B] hover:text-[#4A2C1A] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Spatial Catalog</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-[#746B61]">
            <Globe className="w-3.5 h-3.5 text-[#A9794F]" />
            <span>Billing Currency:</span>
            <strong className="text-[#4A2C1A] font-bold">{currencyConfig.code} ({currencyConfig.symbol.trim()})</strong>
          </div>
        </div>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Form (7 Columns) */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Client Identity */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4A2C1A]/10 shadow-soft-sm space-y-4">
              <h3 className="font-display font-bold text-lg text-[#4A2C1A] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#8B5A2B]" />
                <span>1. Client Authentication & Contact</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#514A43] block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-[#FCFAF7] border border-[#DED7CD] rounded-xl px-3.5 py-2.5 text-xs text-[#211E1B] focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#514A43] block mb-1">Mobile Phone (for Delivery SMS/OTP)</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#FCFAF7] border border-[#DED7CD] rounded-xl px-3.5 py-2.5 text-xs text-[#211E1B] focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20 transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-[#514A43] block mb-1">Email (for Invoices & Tracking)</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#FCFAF7] border border-[#DED7CD] rounded-xl px-3.5 py-2.5 text-xs text-[#211E1B] focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 2. Delivery Address */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4A2C1A]/10 shadow-soft-sm space-y-4">
              <h3 className="font-display font-bold text-lg text-[#4A2C1A] flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#8B5A2B]" />
                <span>2. White-Glove In-Home Destination</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#514A43] block mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-[#FCFAF7] border border-[#DED7CD] rounded-xl px-3.5 py-2.5 text-xs text-[#211E1B] focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#514A43] block mb-1">Apartment, Floor, Suite (Optional)</label>
                  <input
                    type="text"
                    value={formData.apartment}
                    onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                    className="w-full bg-[#FCFAF7] border border-[#DED7CD] rounded-xl px-3.5 py-2.5 text-xs text-[#211E1B] focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20 transition-all"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#514A43] block mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-[#FCFAF7] border border-[#DED7CD] rounded-xl px-3 py-2 text-xs text-[#211E1B] focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#514A43] block mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full bg-[#FCFAF7] border border-[#DED7CD] rounded-xl px-3 py-2 text-xs text-[#211E1B] focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#514A43] block mb-1">Pincode</label>
                    <input
                      type="text"
                      required
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full bg-[#FCFAF7] border border-[#DED7CD] rounded-xl px-3 py-2 text-xs text-[#211E1B] focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Secure Payment Gateway & COD Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4A2C1A]/10 shadow-soft-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-[#4A2C1A] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#8B5A2B]" />
                  <span>3. Payment Engine & Verification</span>
                </h3>
                <span className="text-[11px] text-[#557A5A] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  256-Bit Encrypted
                </span>
              </div>

              {/* Payment Methods Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'upi_razorpay', label: 'UPI Instant', icon: QrCode },
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

              {/* UPI Option Info */}
              {formData.paymentMethod === 'upi_razorpay' && (
                <div className="p-4 bg-[#FCFAF7] rounded-2xl border border-[#EEE9E1] text-xs text-[#514A43] flex items-center gap-4 animate-fadeIn">
                  <div className="w-12 h-12 bg-white rounded-xl border border-[#DED7CD] flex items-center justify-center text-[#4A2C1A] font-bold shadow-sm">
                    UPI
                  </div>
                  <div>
                    <div className="font-semibold text-[#211E1B]">Instant UPI QR / App Intent</div>
                    <p className="text-[11px] text-[#9C9287]">Google Pay, PhonePe, Paytm, or BHIM.</p>
                  </div>
                </div>
              )}

              {/* International Card Info */}
              {formData.paymentMethod === 'international_card' && (
                <div className="p-4 bg-[#FCFAF7] rounded-2xl border border-[#8B5A2B]/20 text-xs text-[#514A43] space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-2 text-[#8B5A2B] font-semibold">
                    <Globe className="w-4 h-4" />
                    <span>Global Multi-Currency Card Settlement</span>
                  </div>
                  <p className="text-[11px] text-[#746B61]">
                    Accepts Visa, Mastercard, American Express, and JCB issued outside India. Dynamic conversion automatically applied in {currencyConfig.code}.
                  </p>
                </div>
              )}

              {/* Cash on Delivery (COD) OTP Verification Engine */}
              {formData.paymentMethod === 'cod' && (
                <div className="p-5 bg-[#FAF7F2] rounded-2xl border border-[#8B5A2B]/30 text-xs space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-[#8B5A2B]/20 pb-3">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-[#8B5A2B]" />
                      <span className="font-bold text-[#4A2C1A]">Cash on Delivery Policy & OTP Verification</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#8B5A2B]/15 text-[#8B5A2B] rounded-full">
                      Bespoke Safety
                    </span>
                  </div>

                  {!isCodEligible ? (
                    <div className="p-3 bg-red-50 text-red-700 rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Cash on Delivery is available for orders between ₹2,500 and ₹1,50,000.</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-[11px] text-[#746B61] leading-relaxed">
                        To prevent fraudulent bookings of high-value artisanal furniture, please confirm your phone number with a 6-digit verification code.
                        {codFee > 0 ? (
                          <span className="block mt-1 text-[#8B5A2B] font-semibold">
                            COD White-Glove Handling Fee: ₹{codFee} (Complimentary on orders above ₹50,000).
                          </span>
                        ) : (
                          <span className="block mt-1 text-[#557A5A] font-semibold">
                            Complimentary COD Handling on orders above ₹50,000.
                          </span>
                        )}
                      </div>

                      {/* OTP Box */}
                      {!isCodVerified ? (
                        <div className="space-y-3 pt-2">
                          {!codOtpSent ? (
                            <button
                              type="button"
                              onClick={handleSendCodOtp}
                              disabled={isSendingOtp}
                              className="w-full bg-[#4A2C1A] text-white py-2.5 rounded-xl font-semibold text-xs hover:bg-[#8B5A2B] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>{isSendingOtp ? 'Sending SMS Code...' : `Send OTP Code to ${formData.phone}`}</span>
                            </button>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  placeholder="Enter 6-Digit OTP"
                                  maxLength={6}
                                  value={codOtpInput}
                                  onChange={(e) => setCodOtpInput(e.target.value)}
                                  className="flex-1 bg-white border border-[#8B5A2B]/40 rounded-xl px-3.5 py-2.5 text-xs text-center font-mono tracking-widest text-[#211E1B] focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]"
                                />
                                <button
                                  type="button"
                                  onClick={handleVerifyCodOtp}
                                  className="bg-[#557A5A] text-white px-5 py-2.5 rounded-xl font-semibold text-xs hover:bg-[#436147] transition-all shadow-sm cursor-pointer"
                                >
                                  Verify OTP
                                </button>
                              </div>
                              <div className="text-[10px] text-[#9C9287] flex justify-between">
                                <span>Code sent to {formData.phone}</span>
                                <button
                                  type="button"
                                  onClick={handleSendCodOtp}
                                  className="text-[#8B5A2B] underline cursor-pointer"
                                >
                                  Resend Code
                                </button>
                              </div>
                            </div>
                          )}

                          {codError && (
                            <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {codError}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 bg-[#557A5A]/10 border border-[#557A5A]/30 rounded-xl flex items-center gap-2 text-[#557A5A] font-semibold text-xs">
                          <Check className="w-4 h-4" />
                          <span>Phone contact verified. Cash on Delivery is unlocked for checkout.</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Order Summary (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4A2C1A]/10 shadow-soft-sm space-y-6 sticky top-28">
              <h3 className="font-display font-bold text-lg text-[#211E1B]">
                Order Summary ({cart.length} Pieces)
              </h3>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1 divide-y divide-[#F7F4EF]">
                {cart.map((item) => (
                  <div key={item.id} className="pt-3 flex gap-3 items-center">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-lg object-cover bg-[#F7F4EF]"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="font-semibold text-[#211E1B] truncate">{item.product.name}</div>
                      <div className="text-[10px] text-[#9C9287]">
                        Qty: {item.quantity} • {item.selectedColor}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-[#4A2C1A]">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="pt-4 border-t border-[#EEE9E1] space-y-2 text-xs text-[#746B61]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#211E1B]">{formatPrice(cartSubtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#557A5A]">
                    <span>Privilege Savings</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>White-Glove In-Home Care</span>
                  <span className="text-[#557A5A] font-semibold">Complimentary</span>
                </div>
                {codFee > 0 && (
                  <div className="flex justify-between text-[#8B5A2B]">
                    <span>COD White-Glove Fee</span>
                    <span className="font-semibold">{formatPrice(codFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-[#211E1B] pt-3 border-t border-[#EEE9E1]">
                  <span>Total Investment</span>
                  <span className="text-lg text-[#4A2C1A]">{formatPrice(effectiveTotal)}</span>
                </div>
              </div>

              {/* Complete Order Action */}
              <button
                type="submit"
                disabled={isSubmitting || (formData.paymentMethod === 'cod' && !isCodVerified)}
                className="btn-primary-shimmer w-full text-white py-4 rounded-xl font-semibold text-sm shadow-md flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Securing Order & Workshop Allocation...</span>
                ) : (
                  <>
                    <span>
                      {formData.paymentMethod === 'cod'
                        ? 'Place Cash on Delivery Order'
                        : 'Confirm & Authorize Payment'}
                    </span>
                    <ArrowRight className="w-4 h-4 interactive-arrow" />
                  </>
                )}
              </button>

              <div className="text-center text-[11px] text-[#9C9287]">
                10-Year Generational Warranty & 30-Day In-Home Trial included.
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
