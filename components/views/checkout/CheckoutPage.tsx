'use client';

import React, { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CheckoutPage: React.FC = () => {
  const { cart, cartSubtotal, discountAmount, shippingCost, cartTotal, createOrder, navigate } = useStore();

  const [formData, setFormData] = useState({
    fullName: 'Aarav Singhania',
    email: 'aarav.singhania@veloura.live',
    phone: '+91 98201 54321',
    address: 'Skyline Penthouse 34A, Worli Sea Face',
    apartment: 'Tower B, 34th Floor',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400018',
    paymentMethod: 'upi_razorpay' as 'upi_razorpay' | 'credit_card' | 'netbanking' | 'emi',
    cardNumber: '4532 •••• •••• 8921',
    cardExpiry: '08/29',
    cardCvv: '•••'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string | null>(null);

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

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
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
        total: cartTotal,
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
        paymentStatus: 'Paid'
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

          <h1 className="font-display font-bold text-3xl text-[#211E1B]">
            Thank You, {formData.fullName}.
          </h1>

          <p className="text-xs sm:text-sm text-[#746B61] leading-relaxed">
            Your handcrafted pieces have been assigned to our master workshop. Your order reference is{' '}
            <strong className="text-[#4A2C1A]">{createdOrderNumber}</strong>. We have dispatched a full tracking dossier and tax invoice to <strong>{formData.email}</strong>.
          </p>

          <div className="p-4 bg-[#FCFAF7] rounded-2xl border border-[#EEE9E1] text-xs text-[#514A43] space-y-1 text-left">
            <div><strong>Delivery Address:</strong> {formData.address}, {formData.city} - {formData.pincode}</div>
            <div><strong>White-Glove Slot:</strong> Scheduled for 07 Oct 2026 (Complimentary Assembly)</div>
            <div><strong>Total Paid:</strong> ₹{cartTotal.toLocaleString('en-IN')}</div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/account')}
              className="btn-primary-shimmer active:scale-[0.98] flex-1 text-white py-3.5 rounded-xl text-xs font-semibold shadow-md cursor-pointer"
            >
              Track Order in Account Portal
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-secondary-refined active:scale-95 px-6 py-3.5 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFAF7] py-10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <button
            onClick={() => navigate('/shop')}
            className="text-xs font-semibold text-[#8B5A2B] hover:text-[#4A2C1A] flex items-center gap-1.5 mb-2 group cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span>Continue Browsing Catalog</span>
          </button>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#211E1B]">
            White-Glove Checkout
          </h1>
          <p className="text-xs text-[#746B61] mt-1">
            Complimentary in-home unboxing, placement, and debris removal included.
          </p>
        </div>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form Details (7 Columns) */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Customer Contact */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4A2C1A]/10 shadow-soft-sm space-y-4">
              <h3 className="font-display font-bold text-lg text-[#4A2C1A] flex items-center gap-2">
                <span>1. Contact & Identity</span>
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
                  <label className="text-xs font-semibold text-[#514A43] block mb-1">Phone (for Delivery Slot Coordination)</label>
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

            {/* 3. Secure Payment Gateway */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4A2C1A]/10 shadow-soft-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-[#4A2C1A] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#8B5A2B]" />
                  <span>3. Secure Payment Architecture</span>
                </h3>
                <span className="text-[11px] text-[#557A5A] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  256-Bit Encrypted
                </span>
              </div>

              {/* Payment Methods */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'upi_razorpay', label: 'UPI / QR Instant', icon: QrCode },
                  { id: 'credit_card', label: 'Credit Card', icon: CreditCard },
                  { id: 'emi', label: '0% Interest EMI', icon: Sparkles },
                  { id: 'netbanking', label: 'NetBanking', icon: Lock }
                ].map((pm) => {
                  const Icon = pm.icon;
                  const isSelected = formData.paymentMethod === pm.id;
                  return (
                    <button
                      type="button"
                      key={pm.id}
                      onClick={() => setFormData({ ...formData, paymentMethod: pm.id as any })}
                      className={`p-3 rounded-2xl border text-center transition-all duration-200 interactive-pill cursor-pointer flex flex-col items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#F5E6D3]/60 border-[#8B5A2B] ring-2 ring-[#8B5A2B]/20 text-[#4A2C1A] font-bold shadow-sm'
                          : 'bg-[#FCFAF7] border-[#EEE9E1] text-[#746B61] hover:bg-white hover:border-[#8B5A2B]/40'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-[#8B5A2B]" />
                      <span className="text-[11px]">{pm.label}</span>
                    </button>
                  );
                })}
              </div>

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
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="pt-4 border-t border-[#EEE9E1] space-y-2 text-xs text-[#746B61]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#211E1B]">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#557A5A]">
                    <span>Privilege Savings</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>White-Glove In-Home Care</span>
                  <span className="text-[#557A5A] font-semibold">Complimentary</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#211E1B] pt-3 border-t border-[#EEE9E1]">
                  <span>Total Order Investment</span>
                  <span className="text-lg text-[#4A2C1A]">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Complete Order Action */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary-shimmer w-full text-white py-4 rounded-xl font-semibold text-sm shadow-md flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.98] disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span>Securing Order & Workshop Allocation...</span>
                ) : (
                  <>
                    <span>Confirm & Authorize Payment</span>
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
