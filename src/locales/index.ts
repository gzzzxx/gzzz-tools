/*
  src/locales/index.ts — vue-i18n bootstrap.

  Loads the per-locale JSON message bundles, creates the i18n
  instance in Composition API mode (`legacy: false`), and wires
  the user's choice to localStorage so it survives reloads.

  Why one JSON per locale (vs. nested folders per concern):
  - 30~50 keys is well under the size that would justify splitting.
  - One file per language = one diff per translation change,
    easier for non-dev contributors.
  - When/if it gets unwieldy, switch to a folder of JSON files
    + a `mergeMessages()` import step; the consumer side
    (`useI18n()` / `t()`) doesn't change at all.
*/
import { watch } from 'vue'
import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN/index.json'
import enUS from './en-US/index.json'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

export type AppLocale = 'zh-CN' | 'en-US'

export const SUPPORTED_LOCALES: AppLocale[] = ['zh-CN', 'en-US']
export const DEFAULT_LOCALE: AppLocale = 'zh-CN'
const STORAGE_KEY = 'gzzz:locale'

// dayjs locale names — element-plus's date-picker / calendar call
// `dayjs(x).locale(lang)` with element-plus's own locale name
// ('zh-cn' / 'en'), so the matching dayjs locale has to be registered.
//
// This lives in the i18n bootstrap rather than inside a view component
// on purpose: registering it from a lazily-loaded route meant the
// date-picker fell back to English month names until the user happened
// to visit that route first.
const DAYJS_LOCALE: Record<AppLocale, string> = {
  'zh-CN': 'zh-cn',
  'en-US': 'en',
}

function loadInitialLocale(): AppLocale {
  if (typeof localStorage === 'undefined') return DEFAULT_LOCALE
  const saved = localStorage.getItem(STORAGE_KEY) as AppLocale | null
  return saved && SUPPORTED_LOCALES.includes(saved) ? saved : DEFAULT_LOCALE
}

export const i18n = createI18n({
  legacy: false,           // Composition API: useI18n() instead of $t
  globalInjection: true,   // expose $t on every component (handy in templates)
  locale: loadInitialLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
})

// Persist the user's choice and keep <html lang> in sync so screen
// readers + any lang-aware CSS can react. Runs at module load —
// before the app mounts — so the first paint already has the
// correct lang attribute.
if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.global.locale.value
  // element-plus's el-calendar reads the *global* dayjs locale to
  // decide the first day of the week (Sunday for en, Monday for zh),
  // so the global locale has to follow the app locale as well.
  dayjs.locale(DAYJS_LOCALE[i18n.global.locale.value as AppLocale])
  watch(
    () => i18n.global.locale.value,
    (next) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, next)
      }
      document.documentElement.lang = next
      dayjs.locale(DAYJS_LOCALE[next as AppLocale])
    },
  )
}
