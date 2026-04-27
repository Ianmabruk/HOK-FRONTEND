export const DEFAULT_CURRENCY = 'USD'

export const CURRENCIES = {
  USD: { code: 'USD', label: 'USD $', name: 'US Dollar', locale: 'en-US', rate: 1 },
  KES: { code: 'KES', label: 'KES KSh', name: 'Kenyan Shilling', locale: 'en-KE', rate: 129.5 },
  NGN: { code: 'NGN', label: 'NGN Naira', name: 'Nigerian Naira', locale: 'en-NG', rate: 1550 },
}

export function getCurrencyConfig(currency = DEFAULT_CURRENCY) {
  return CURRENCIES[currency] || CURRENCIES[DEFAULT_CURRENCY]
}

export function convertPrice(amount, currency = DEFAULT_CURRENCY) {
  const numericAmount = Number(amount || 0)
  return numericAmount * getCurrencyConfig(currency).rate
}

export function formatPrice(amount, currency = DEFAULT_CURRENCY, options = {}) {
  const config = getCurrencyConfig(currency)

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: options.minimumFractionDigits ?? 2,
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
  }).format(convertPrice(amount, currency))
}
