import { useSyncExternalStore } from 'react'
import { Button } from '../shared/Button'
import { applyTheme } from './theme'

const preference = () => window.matchMedia('(prefers-color-scheme: dark)')

function darkThemeEnabled() {
  const theme = document.documentElement.dataset.theme
  return theme ? theme === 'dark' : preference().matches
}

function subscribe(onChange: () => void) {
  const media = preference()
  media.addEventListener('change', onChange)
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributeFilter: ['data-theme'] })
  return () => {
    media.removeEventListener('change', onChange)
    observer.disconnect()
  }
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, darkThemeEnabled)
  return (
    <Button aria-pressed={dark} onClick={() => applyTheme(dark ? 'light' : 'dark')}>
      Dark theme
    </Button>
  )
}
