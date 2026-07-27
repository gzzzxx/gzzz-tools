import { nextTick } from 'vue'
import { useIsDark } from './useIsDark'

const STORAGE_KEY = 'theme'

function needViewTransitionDprFix() {
  const ua = navigator.userAgent
  const chromeMatch = ua.match(/Chrome\/(\d+)/)
  const isEdge = /Edg\/\d+/.test(ua)
  if (chromeMatch && !isEdge) {
    return Number(chromeMatch[1]) >= 150
  }
  return false
}

export function initTheme(): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const stored = typeof localStorage !== 'undefined'
    ? localStorage.getItem(STORAGE_KEY)
    : null
  const next = stored === 'light' ? 'light' : 'dark'
  root.classList.remove('light', 'dark')
  root.classList.add(next)
}

export function useTheme() {
  const isDarkRef = useIsDark()

  function toggleTheme(payload: { clientX: number; clientY: number }): void {
    if (typeof document === 'undefined') return

    const { clientX, clientY } = payload
    const isDark = isDarkRef.value

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, isDark ? 'light' : 'dark')
    }

    if (!document.startViewTransition) {
      const root = document.documentElement
      root.classList.remove(isDark ? 'dark' : 'light')
      root.classList.add(isDark ? 'light' : 'dark')
      return
    }

    const root = document.documentElement
    const dpr = needViewTransitionDprFix()
      ? window.devicePixelRatio || 1
      : 1
    const x = clientX * dpr
    const y = clientY * dpr
    const width = window.innerWidth * dpr
    const height = window.innerHeight * dpr

    root.style.setProperty('--vt-x', `${x}px`)
    root.style.setProperty('--vt-y', `${y}px`)

    const endRadius = Math.hypot(
      Math.max(x, width - x),
      Math.max(y, height - y),
    )

    root.style.setProperty('--vt-radius', `${endRadius}px`)

    const transition = document.startViewTransition({
      update: async () => {
        root.classList.remove(isDark ? 'dark' : 'light')
        root.classList.add(isDark ? 'light' : 'dark')
        await nextTick()
      },
      types: [
        isDark ? 'light-to-dark' : 'dark-to-light',
      ],
    })

    transition.finished.finally(() => {
      root.style.removeProperty('--vt-x')
      root.style.removeProperty('--vt-y')
      root.style.removeProperty('--vt-radius')
    })
  }

  return { toggleTheme }
}