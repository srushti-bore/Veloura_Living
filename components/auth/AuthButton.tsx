'use client';

import React from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
  showArrow?: boolean;
  children: React.ReactNode;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  variant = 'primary',
  isLoading = false,
  showArrow = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'w-full py-3.5 px-6 rounded-xl font-sans text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 shadow-sm';

  const variantStyles = {
    primary:
      'bg-[#4A2C1A] hover:bg-[#382012] text-[#FAF7F2] shadow-[0_2px_8px_rgba(74,44,26,0.18)] hover:shadow-[0_4px_12px_rgba(74,44,26,0.25)]',
    secondary:
      'bg-[#FAF7F2] hover:bg-[#F2ECE1] text-[#2B1D14] border border-[#E2D8CC] hover:border-[#D0C0B0]',
    outline:
      'bg-transparent hover:bg-[#FAF7F2] text-[#2B1D14] border border-[#2B1D14]',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Processing...</span>
        </span>
      ) : (
        <>
          <span>{children}</span>
          {showArrow && (
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          )}
        </>
      )}
    </button>
  );
};
