// Currency formatting and conversion utilities

export const CURRENCIES: Record<string, { symbol: string; name: string; locale: string }> = {
  NGN: { symbol: '₦', name: 'Nigerian Naira',   locale: 'en-NG' },
  USD: { symbol: '$', name: 'US Dollar',         locale: 'en-US' },
  GBP: { symbol: '£', name: 'British Pound',     locale: 'en-GB' },
  EUR: { symbol: '€', name: 'Euro',              locale: 'de-DE' },
  GHS: { symbol: 'GH₵', name: 'Ghanaian Cedi',  locale: 'en-GH' },
  KES: { symbol: 'KSh', name: 'Kenyan Shilling', locale: 'en-KE' },
  ZAR: { symbol: 'R',  name: 'South African Rand', locale: 'en-ZA' },
  CAD: { symbol: 'CA$', name: 'Canadian Dollar', locale: 'en-CA' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
};

// Approximate exchange rates relative to NGN (base). User can override in settings.
// These are fallbacks — not live rates.
export const FALLBACK_RATES_FROM_NGN: Record<string, number> = {
  NGN: 1,
  USD: 1 / 1580,
  GBP: 1 / 1980,
  EUR: 1 / 1720,
  GHS: 1 / 110,
  KES: 1 / 10,
  ZAR: 1 / 82,
  CAD: 1 / 1160,
  AUD: 1 / 1040,
};

export function formatCurrency(
  amount: number,
  currency: string = 'NGN',
  compact = false
): string {
  const info = CURRENCIES[currency];
  const symbol = info?.symbol ?? currency;

  if (compact && Math.abs(amount) >= 1_000_000) {
    return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (compact && Math.abs(amount) >= 1_000) {
    return `${symbol}${(amount / 1_000).toFixed(1)}K`;
  }

  // Format with locale-aware number formatting
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${amount < 0 ? '-' : ''}${symbol}${formatted}`;
}

export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  customRates?: Record<string, number>
): number {
  if (fromCurrency === toCurrency) return amount;
  const rates = customRates ?? FALLBACK_RATES_FROM_NGN;

  // Convert to NGN first (base), then to target
  const inNGN = fromCurrency === 'NGN' ? amount : amount / (rates[fromCurrency] ?? 1);
  const converted = toCurrency === 'NGN' ? inNGN : inNGN * (rates[toCurrency] ?? 1);
  return converted;
}

export function parseCurrencyInput(input: string): number {
  // Remove all non-numeric characters except decimal point
  const cleaned = input.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function getCurrencySymbol(currency: string): string {
  return CURRENCIES[currency]?.symbol ?? currency;
}
