/**
 * 🏛️ Veloura Living — Multi-Currency Dynamic Pricing & FX Engine
 * Phase 11 Standard Implementation (CON-003)
 */

export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  symbolPosition: 'prefix' | 'suffix';
  decimals: number;
  locale: string;
  rateFromINR: number; // 1 INR in this currency
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  INR: {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    symbolPosition: 'prefix',
    decimals: 0,
    locale: 'en-IN',
    rateFromINR: 1.0,
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    symbolPosition: 'prefix',
    decimals: 2,
    locale: 'en-US',
    rateFromINR: 0.01188, // ~ ₹84.18 / USD
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    symbolPosition: 'prefix',
    decimals: 2,
    locale: 'de-DE',
    rateFromINR: 0.01093, // ~ ₹91.50 / EUR
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    symbolPosition: 'prefix',
    decimals: 2,
    locale: 'en-GB',
    rateFromINR: 0.00911, // ~ ₹109.80 / GBP
  },
  AED: {
    code: 'AED',
    name: 'UAE Dirham',
    symbol: 'AED ',
    symbolPosition: 'prefix',
    decimals: 2,
    locale: 'en-AE',
    rateFromINR: 0.04365, // ~ ₹22.91 / AED
  },
  SGD: {
    code: 'SGD',
    name: 'Singapore Dollar',
    symbol: 'S$',
    symbolPosition: 'prefix',
    decimals: 2,
    locale: 'en-SG',
    rateFromINR: 0.01545, // ~ ₹64.72 / SGD
  },
};

class CurrencyEngine {
  private rates: Record<string, CurrencyConfig> = { ...SUPPORTED_CURRENCIES };
  private lastUpdated: string = new Date().toISOString();

  public getSupportedCurrencies(): CurrencyConfig[] {
    return Object.values(this.rates);
  }

  public getCurrency(code: string = 'INR'): CurrencyConfig {
    const upper = code.toUpperCase();
    return this.rates[upper] || this.rates.INR;
  }

  public convertFromINR(amountInINR: number, targetCurrency: string = 'INR'): number {
    const config = this.getCurrency(targetCurrency);
    const converted = amountInINR * config.rateFromINR;
    return config.decimals === 0 ? Math.round(converted) : Number(converted.toFixed(config.decimals));
  }

  public convertToINR(amountInTargetCurrency: number, sourceCurrency: string = 'INR'): number {
    const config = this.getCurrency(sourceCurrency);
    if (config.rateFromINR <= 0) return amountInTargetCurrency;
    return Math.round(amountInTargetCurrency / config.rateFromINR);
  }

  public formatPrice(amountInINR: number, targetCurrency: string = 'INR'): string {
    const config = this.getCurrency(targetCurrency);
    const converted = this.convertFromINR(amountInINR, targetCurrency);
    
    if (config.code === 'INR') {
      return `₹${new Intl.NumberFormat('en-IN').format(converted)}`;
    }

    const formattedNumber = new Intl.NumberFormat(config.locale, {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }).format(converted);

    return config.symbolPosition === 'prefix'
      ? `${config.symbol}${formattedNumber}`
      : `${formattedNumber} ${config.symbol}`;
  }

  public getRatesSummary() {
    return {
      baseCurrency: 'INR',
      lastUpdated: this.lastUpdated,
      currencies: this.rates,
    };
  }
}

export const currencyEngine = new CurrencyEngine();
