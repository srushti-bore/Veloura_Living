'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCheckout } from '@/providers/CheckoutProvider';
import { Lock, Check } from 'lucide-react';

interface StepDefinition {
  num: 1 | 2 | 3 | 4 | 5;
  id: 'identity' | 'delivery' | 'atelier' | 'review' | 'payment';
  path: string;
  label: string;
}

const CHECKOUT_STEPS: StepDefinition[] = [
  { num: 1, id: 'identity', path: '/checkout/identity', label: 'Client Identity' },
  { num: 2, id: 'delivery', path: '/checkout/delivery', label: 'Delivery Destination' },
  { num: 3, id: 'atelier', path: '/checkout/atelier', label: 'Atelier Staging' },
  { num: 4, id: 'review', path: '/checkout/review', label: 'Order & Vault Review' },
  { num: 5, id: 'payment', path: '/checkout/payment', label: 'Payment' },
];

interface Props {
  currentStepNum: 1 | 2 | 3 | 4 | 5;
}

export const CheckoutStepper: React.FC<Props> = ({ currentStepNum }) => {
  const router = useRouter();
  const { isStepAccessible } = useCheckout();

  const handleStepClick = (step: StepDefinition) => {
    if (step.num < currentStepNum || isStepAccessible(step.num)) {
      router.push(step.path);
    }
  };

  return (
    <>
      {/* ================= DESKTOP EDITORIAL LEFT STEPPER RAIL ================= */}
      <aside className="hidden lg:flex flex-col justify-between h-full min-h-[560px] pr-4">
        <div className="space-y-8">
          
          {/* Header */}
          <div>
            <h1 className="font-serif text-2xl sm:text-[26px] text-[#2B1810] font-normal tracking-tight">
              Checkout
            </h1>
            <p className="text-xs text-[#7A6B60] leading-snug mt-1.5 max-w-[180px]">
              A seamless journey to your dream space.
            </p>
          </div>

          {/* Stepper Vertical Navigation */}
          <nav aria-label="Checkout Progress" className="relative space-y-6 pt-2">
            {/* Connecting Vertical Line */}
            <div className="absolute left-[15px] top-4 bottom-4 w-[1px] bg-[#D9CBC0] -z-0" />

            {CHECKOUT_STEPS.map((step) => {
              const isCompleted = currentStepNum > step.num;
              const isActive = currentStepNum === step.num;
              const isClickable = isCompleted || step.num === currentStepNum;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => handleStepClick(step)}
                  disabled={!isClickable}
                  className={`w-full flex items-center gap-3.5 text-left transition-colors relative z-10 group ${
                    isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                >
                  {/* Circular Step Badge */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono shrink-0 transition-all ${
                      isActive
                        ? 'bg-[#3B2314] text-[#F5EFE6] font-semibold shadow-sm'
                        : isCompleted
                        ? 'border border-[#D9CBC0] bg-[#E8DDD1] text-[#2B1810]'
                        : 'border border-[#D9CBC0] bg-[#F4ECE1] text-[#7A6B60]'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 stroke-[2.2] text-[#2B1810]" />
                    ) : (
                      `0${step.num}`
                    )}
                  </div>

                  {/* Step Label */}
                  <span
                    className={`text-[13px] font-sans tracking-wide transition-colors ${
                      isActive
                        ? 'text-[#2B1810] font-medium'
                        : isCompleted
                        ? 'text-[#2B1810] font-normal group-hover:text-[#3B2314]'
                        : 'text-[#7A6B60]'
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Security Badge */}
        <div className="pt-8 flex items-center gap-3 text-[#7A6B60]">
          <div className="w-8 h-8 rounded-full border border-[#D9CBC0] flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4 text-[#3B2314] stroke-[1.5]" />
          </div>
          <div className="text-[11px] leading-tight">
            <div className="font-semibold text-[#2B1810] text-xs">Secure &amp; Encrypted.</div>
            <div className="text-[#7A6B60] text-[11px] mt-0.5">Your information is safe with us.</div>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE COMPACT STEPPER ================= */}
      <div className="block lg:hidden mb-6 pb-4 border-b border-[#D9CBC0]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#7A6B60]">
            Step 0{currentStepNum} of 05
          </span>
          <span className="font-serif text-sm font-medium text-[#2B1810]">
            {CHECKOUT_STEPS[currentStepNum - 1]?.label}
          </span>
        </div>

        {/* Minimal Progress Line */}
        <div className="w-full h-1 bg-[#E5D8CA] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#3B2314] transition-all duration-300"
            style={{ width: `${(currentStepNum / 5) * 100}%` }}
          />
        </div>
      </div>
    </>
  );
};
