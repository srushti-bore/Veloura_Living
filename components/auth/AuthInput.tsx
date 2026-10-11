'use client';

import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
  error?: string | null;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  (
    {
      label,
      icon,
      showPasswordToggle = false,
      type = 'text',
      error,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const inputId = id || props.name || 'auth-input';
    const computedType = showPasswordToggle
      ? isPasswordVisible
        ? 'text'
        : 'password'
      : type;

    return (
      <div className="w-full space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[11px] font-sans font-medium uppercase tracking-[0.12em] text-[#5C4535]"
          >
            {label}
          </label>
        )}

        <div className="relative group">
          {/* Leading Icon */}
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A89887] group-focus-within:text-[#7A4E2D] transition-colors pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}

          {/* Form Input */}
          <input
            ref={ref}
            id={inputId}
            type={computedType}
            className={`w-full ${
              icon ? 'pl-11' : 'pl-3.5'
            } ${
              showPasswordToggle ? 'pr-11' : 'pr-3.5'
            } py-3 bg-[#FAF7F2] border ${
              error ? 'border-[#A34235] focus:ring-[#A34235]' : 'border-[#E2D8CC] focus:border-[#7A4E2D] focus:ring-[#7A4E2D]'
            } rounded-xl text-sm font-sans text-[#2B1D14] placeholder-[#A89887] focus:outline-none focus:ring-1 focus:bg-white transition-all duration-200 ${className}`}
            {...props}
          />

          {/* Password Toggle */}
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A89887] hover:text-[#4A2C1A] focus:outline-none p-1 transition-colors cursor-pointer"
              aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {isPasswordVisible ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {error && (
          <p className="text-xs text-[#A34235] font-sans mt-1 animate-fade-in">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = 'AuthInput';
