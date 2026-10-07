'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/hooks/useStore';
import { useCurrency } from '@/providers/CurrencyProvider';
import { useCheckout } from '@/providers/CheckoutProvider';
import {
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PaymentStep: React.FC = () => {
  const router = useRouter();
  const { cart, cartSubtotal, discountAmount, shippingCost, cartTotal, createOrder } = useStore();
  const { formatPrice, currentCurrency } = useCurrency();
  const {
    identity,
    delivery,
    atelier,
    payment,
    updatePayment,
    setCreatedOrderNumber,
    setPaymentTxnRef,
    isCodVerified,
    setIsCodVerified,
    codVerificationId,
    setCodVerificationId,
    markStepCompleted,
  } = useCheckout();

  const [, setIsRazorpayLoaded] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // COD State
  const [codOtpSent, setCodOtpSent] = useState(false);
  const [codOtpInput, setCodOtpInput] = useState('');
  const [codError, setCodError] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const codFee = payment.paymentMethod === 'cod' ? (cartTotal >= 50000 ? 0 : 750) : 0;
  const effectiveTotal = cartTotal + codFee;

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

  // Handle COD OTP dispatch
  const handleSendCodOtp = async () => {
    setIsSendingOtp(true);
    setCodError(null);
    try {
      const res = await fetch('/api/orders/cod-otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneOrEmail: identity.phone || identity.email,
          amountInINR: cartTotal,
          postalCode: delivery.pincode,
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

  // Finalize order creation & navigate to /checkout/success
  const finalizeOrder = async (paymentRef: string) => {
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
        quantity: item.quantity,
      })),
      subtotal: cartSubtotal,
      discount: discountAmount,
      shipping: shippingCost,
      total: effectiveTotal,
      customer: {
        fullName: identity.fullName || `${identity.firstName || 'Aarav'} ${identity.lastName || 'Singhania'}`,
        email: identity.email || 'aarav.singhania@veloura.live',
        phone: identity.phone || '+91 98201 54321',
        address: delivery.address || 'Tower B, 34th Floor, Skyline Penthouse',
        apartment: delivery.apartment,
        city: delivery.city || 'Worli Sea Face, Mumbai',
        state: delivery.state || 'Maharashtra',
        pincode: delivery.pincode || '400018',
      },
      estimatedDeliveryDate: '07 Oct 2026',
      paymentMethod: payment.paymentMethod,
      paymentStatus: payment.paymentMethod === 'cod' ? 'Pending' : 'Paid',
      currency: currentCurrency,
      codHandlingFee: codFee,
      codVerified: payment.paymentMethod === 'cod' ? true : undefined,
    });

    setPaymentTxnRef(paymentRef);
    setCreatedOrderNumber(order.orderNumber);
    markStepCompleted(5);
    setIsProcessingPayment(false);
    setIsSubmitting(false);

    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.log(e);
    }

    router.push(`/checkout/success?orderId=${order.orderNumber}`);
  };

  // Authoritative Razorpay Payment Gateway Trigger
  const handleRazorpayGatewayCheckout = async () => {
    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      const intentRes = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'temp_cart_' + Date.now(),
          amount: effectiveTotal,
          currency: 'INR',
          customerInfo: {
            fullName: identity.fullName || `${identity.firstName || 'Aarav'} ${identity.lastName || 'Singhania'}`,
            email: identity.email || 'aarav.singhania@veloura.live',
            phone: identity.phone || '+91 98201 54321',
          },
        }),
      });

      const intentData = await intentRes.json();
      if (!intentRes.ok || !intentData.success || !intentData.data?.gatewayOrderId) {
        throw new Error(intentData.error?.message || 'Failed to initialize Razorpay payment order.');
      }

      const gatewayOrderId = intentData.data.gatewayOrderId;
      const razorpayKey = intentData.data.keyId;

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
          name: identity.fullName || `${identity.firstName || 'Aarav'} ${identity.lastName || 'Singhania'}`,
          email: identity.email || 'aarav.singhania@veloura.live',
          contact: identity.phone || '+919820154321',
        },
        theme: {
          color: '#3B2314',
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
              finalizeOrder(response.razorpay_payment_id);
            } else {
              setIsProcessingPayment(false);
              setPaymentError(verifyData.error?.message || 'Payment signature verification failed.');
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
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        setIsProcessingPayment(false);
        setPaymentError(
          response.error?.description || response.error?.reason || 'Payment transaction failed. Please retry.'
        );
      });
      rzp.open();
    } catch (err: any) {
      setIsProcessingPayment(false);
      setPaymentError(err.message || 'Payment initiation error.');
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (payment.paymentMethod === 'cod') {
      if (!isCodVerified) {
        setCodError('Please complete phone OTP verification before placing a Cash on Delivery order.');
        return;
      }
      setIsSubmitting(true);
      setTimeout(() => {
        finalizeOrder('COD_PENDING_DELIVERY');
      }, 700);
      return;
    }

    handleRazorpayGatewayCheckout();
  };

  return (
    <form onSubmit={handleSubmitOrder} className="space-y-6">
      {/* Step Counter & Heading */}
      <div>
        <span className="text-xs font-sans text-[#7A6B60]">
          Step 5 of 5
        </span>
        <h2 className="font-serif text-3xl sm:text-[34px] font-normal text-[#2B1810] tracking-tight mt-1">
          Payment
        </h2>
        <p className="text-xs sm:text-[13px] text-[#7A6B60] leading-relaxed mt-2 max-w-lg">
          Complete your order securely.
        </p>
      </div>

      {/* Payment Method Radio Cards */}
      <div className="space-y-2.5 pt-1">
        {[
          {
            id: 'upi_razorpay',
            label: 'Razorpay',
            desc: 'UPI • Cards • Net Banking • Wallets',
            recommended: true,
            hasLogo: true,
          },
          {
            id: 'upi',
            label: 'UPI',
            desc: 'Pay using any UPI app',
          },
          {
            id: 'credit_card',
            label: 'Credit / Debit Card',
            desc: 'Visa, Mastercard, RuPay',
          },
          {
            id: 'netbanking',
            label: 'Net Banking',
            desc: 'All major banks',
          },
          {
            id: 'wallets',
            label: 'Wallets',
            desc: 'PhonePe, Paytm, Amazon Pay',
          },
        ].map((pm) => {
          const isSelected = (payment.paymentMethod || 'upi_razorpay') === pm.id;
          return (
            <label
              key={pm.id}
              onClick={() => {
                updatePayment({ paymentMethod: pm.id as any });
                setCodError(null);
                setPaymentError(null);
              }}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#F9F4ED] border-[#3B2314] shadow-sm'
                  : 'bg-[#F9F4ED]/60 border-[#D9CBC0] hover:border-[#3B2314]/60'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? 'border-[#3B2314] bg-[#3B2314]' : 'border-[#D9CBC0] bg-transparent'
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#F5EFE6]" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-[13px] font-sans font-medium text-[#2B1810]">
                      {pm.label}
                    </span>
                    {pm.recommended && (
                      <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-[#E8DDD1] text-[#5A483C] font-normal">
                        Recommended
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#7A6B60] mt-0.5">{pm.desc}</div>
                </div>
              </div>

              {/* Razorpay Brand Mark on right */}
              {pm.hasLogo && (
                <div className="shrink-0 pl-2">
                  <span className="text-[#0C2340] font-bold italic tracking-tight font-sans text-xs sm:text-[13px] flex items-center gap-1">
                    <span className="text-[#3395FF] text-[10px]">▲</span>Razorpay
                  </span>
                </div>
              )}
            </label>
          );
        })}
      </div>

      {/* 256-Bit SSL Reassurance Banner */}
      <div className="p-4 bg-[#EFE7DD]/90 border border-[#E2D6C7] rounded-2xl flex items-center gap-3 text-xs mt-2">
        <div className="w-7 h-7 rounded-lg border border-[#D9CBC0] bg-[#F4ECE1] flex items-center justify-center shrink-0">
          <Lock className="w-3.5 h-3.5 text-[#3B2314] stroke-[1.5]" />
        </div>
        <p className="text-[#5A483C] text-[11px] sm:text-xs leading-snug">
          Your payment is secured with 256-bit SSL encryption and powered by Razorpay.
        </p>
      </div>

      {paymentError && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>{paymentError}</span>
        </div>
      )}

      {/* Bottom Navigation Buttons */}
      <div className="pt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/checkout/review')}
          className="border border-[#D9CBC0] bg-transparent rounded-xl px-6 py-3 text-xs font-medium text-[#2B1810] flex items-center gap-2 hover:bg-[#EFE6DC] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting || isProcessingPayment}
          className="px-8 py-3.5 rounded-xl bg-[#3B2314] hover:bg-[#2B1810] text-[#F5EFE6] font-sans font-medium text-xs tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm flex items-center gap-2"
        >
          {isProcessingPayment ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Connecting to Razorpay...</span>
            </>
          ) : isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Placing Order...</span>
            </>
          ) : (
            <>
              <span>Pay {formatPrice(effectiveTotal)}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
