import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const PALETTES = {
  heritage: { id: 'heritage', name: 'Original Cream & Brown', description: 'Warm cream surfaces with charcoal and terracotta accents.' },
  stone: { id: 'stone', name: 'Soft Stone', description: 'A quieter neutral palette for product browsing.' },
  sage: { id: 'sage', name: 'Sage Accent', description: 'Keeps the warm base with greener accents.' },
}

export const THEME_OPTIONS = ['light', 'dark']
export const SITE_PALETTES = Object.values(PALETTES)

export function isDarkTheme(themeMode) {
  return themeMode === 'dark'
}

export const useThemeStore = create(
  persist(
    (set) => ({
      themeMode: 'light',
      sitePalette: 'heritage',
      setThemeMode: (themeMode) => set({ themeMode: THEME_OPTIONS.includes(themeMode) ? themeMode : 'light' }),
      setSitePalette: (sitePalette) => set({ sitePalette: PALETTES[sitePalette] ? sitePalette : 'heritage' }),
    }),
    { name: 'theme-storage' }
  )
)
