// useTheme.ts — single source of truth for the dark/light theme.
//
// Responsibilities:
//   - Read the user's saved preference from localStorage at boot
//     (called from main.ts BEFORE the app mounts, so the first paint
//     already has the right class on <html>).
//   - Expose `toggleTheme(clientX, clientY)` which flips the class
//     and animates the transition via the View Transitions API.
//
// Storage: a single key 'theme' with values 'light' | 'dark'. The
// legacy default is 'dark' (matches the original behavior); any
// stored value overrides that.
import { useIsDark } from './useIsDark'

const STORAGE_KEY = 'theme'

/**
 * Apply the saved (or default) theme to <html>. Safe to call before
 * Vue mounts — the implementation only touches the DOM, not Vue.
 *
 * Called from main.ts at module load so the first paint is already
 * correct; calling it again later is a no-op.
 */
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

/**
 * Toggle dark/light, persist the new choice, and animate the
 * transition. Pass the click coordinates so the View Transitions
 * circle clip-path expands from where the user clicked.
 *
 * Falls back to a class flip with no animation on browsers without
 * `document.startViewTransition` (e.g. older Firefox).
 */
export function useTheme() {
  // useIsDark() is a module-level singleton — the live DOM state
  // is its source of truth. We only consult it to know "are we
  // currently dark" before flipping; the actual classList write
  // is the source of truth for everyone else.
  const isDarkRef = useIsDark()

  function toggleTheme(payload: { clientX: number; clientY: number }): void {
    if (typeof document === 'undefined') return
    const { clientX: x, clientY: y } = payload
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    const isDark = isDarkRef.value
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, isDark ? 'light' : 'dark')
    }

    const transition = (document as unknown as {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> }
    }).startViewTransition?.(() => {
      const root = document.documentElement
      root.classList.remove(isDark ? 'dark' : 'light')
      root.classList.add(isDark ? 'light' : 'dark')
    })

    if (!transition) return // browser doesn't support view transitions

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ]
      document.documentElement.animate(
        { clipPath: isDark ? [...clipPath].reverse() : clipPath },
        {
          duration: 800,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          pseudoElement: isDark
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)',
        },
      )
    })
  }

  return { toggleTheme }
}
