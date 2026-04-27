import { useEffect } from 'react'
import { isDarkTheme, useThemeStore } from '../../store/themeStore'

export default function ThemeController() {
  const themeMode = useThemeStore((s) => s.themeMode)
  const sitePalette = useThemeStore((s) => s.sitePalette)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', isDarkTheme(themeMode))
    root.dataset.sitePalette = sitePalette
    root.style.colorScheme = isDarkTheme(themeMode) ? 'dark' : 'light'
  }, [themeMode, sitePalette])

  return null
}
