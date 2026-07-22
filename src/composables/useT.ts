// useT.ts — 一行拿到 global scope 的 i18n composer.
import { useI18n } from 'vue-i18n'

export function useT() {
  return useI18n({ useScope: 'global' })
}
