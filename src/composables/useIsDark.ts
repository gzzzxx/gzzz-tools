import { ref } from 'vue'

// 应用默认主题。必须与 index.html 里那段内联脚本的判定保持一致：
// 只有用户显式存了 'light' 才用浅色，其余一律深色。
//
// 服务端（SSG 预渲染）没有 document，读不到 localStorage，只能按默认值渲染。
// 深色是绝大多数访客的实际主题（没有偏好记录的人默认就是深色），所以服务端
// 也按深色渲染 —— 这样预渲染出来的 HTML 与客户端首帧一致，不会水合后跳变。
export const DEFAULT_IS_DARK = true

// Shared, lazy-mounted singleton. Every caller of useIsDark() gets the same
// ref and the same MutationObserver — adding listeners is cheap, no per-
// component setup needed.
const isDark = ref(DEFAULT_IS_DARK)
let observer: MutationObserver | null = null

function ensureObserver () {
  if (observer || typeof document === 'undefined') return
  const sync = () => {
    isDark.value = document.documentElement.classList.contains('dark')
  }
  sync()
  observer = new MutationObserver(sync)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
}

export function useIsDark () {
  ensureObserver()
  return isDark
}