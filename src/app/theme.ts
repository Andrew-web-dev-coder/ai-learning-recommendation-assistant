const storageKey = 'learning-assistant-theme'
type Theme = 'light' | 'dark'

export function initializeTheme() {
  try {
    const saved = localStorage.getItem(storageKey)
    if (saved === 'light' || saved === 'dark') document.documentElement.dataset.theme = saved
  } catch {
    // The browser can block storage. CSS still follows the system preference.
  }
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(storageKey, theme)
  } catch {
    // Keep the explicit preference for the current document.
  }
}
