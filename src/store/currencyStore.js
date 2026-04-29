import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CURRENCIES, DEFAULT_CURRENCY } from '../utils/currency'

const isSupportedCurrency = (currency) => Object.hasOwn(CURRENCIES, currency)

export const useCurrencyStore = create(
  persist(
    (set) => ({
      currency: DEFAULT_CURRENCY,
      setCurrency: (currency) => set({
        currency: isSupportedCurrency(currency) ? currency : DEFAULT_CURRENCY,
      }),
    }),
    {
      name: 'currency-storage',
      version: 2,
      migrate: () => ({ currency: DEFAULT_CURRENCY }),
    }
  )
)
