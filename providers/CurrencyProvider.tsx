'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { currencyEngine, SUPPORTED_CURRENCIES, CurrencyConfig } from '@/lib/services/currencyEngine';

interface CurrencyContextType {
  currentCurrency: string;
  setCurrency: (code: string) => void;
  formatPrice: (amountInINR: number) => string;
  convertPrice: (amountInINR: number) => number;
  currencyConfig: CurrencyConfig;
  supportedCurrencies: CurrencyConfig[];
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCurrency, setCurrentCurrencyState] = useState<string>('INR');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('veloura_currency');
      if (saved && SUPPORTED_CURRENCIES[saved.toUpperCase()]) {
        setCurrentCurrencyState(saved.toUpperCase());
      }
    } catch {
      // Ignore localStorage read errors in SSR/strict modes
    }
  }, []);

  const setCurrency = (code: string) => {
    const upper = code.toUpperCase();
    if (SUPPORTED_CURRENCIES[upper]) {
      setCurrentCurrencyState(upper);
      try {
        localStorage.setItem('veloura_currency', upper);
      } catch {
        // Ignore write errors
      }
    }
  };

  const formatPrice = (amountInINR: number): string => {
    return currencyEngine.formatPrice(amountInINR, currentCurrency);
  };

  const convertPrice = (amountInINR: number): number => {
    return currencyEngine.convertFromINR(amountInINR, currentCurrency);
  };

  const currencyConfig = currencyEngine.getCurrency(currentCurrency);
  const supportedCurrencies = currencyEngine.getSupportedCurrencies();

  return (
    <CurrencyContext.Provider
      value={{
        currentCurrency,
        setCurrency,
        formatPrice,
        convertPrice,
        currencyConfig,
        supportedCurrencies,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Fallback if accessed outside provider
    return {
      currentCurrency: 'INR',
      setCurrency: () => {},
      formatPrice: (amount: number) => `₹${new Intl.NumberFormat('en-IN').format(amount)}`,
      convertPrice: (amount: number) => amount,
      currencyConfig: SUPPORTED_CURRENCIES.INR,
      supportedCurrencies: Object.values(SUPPORTED_CURRENCIES),
    };
  }
  return context;
};
