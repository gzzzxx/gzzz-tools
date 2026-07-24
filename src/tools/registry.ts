import type { Component } from 'vue'

export type ToolCategory = 'crypto' | 'dev' | 'convert' | 'time'

// The 4 tool categories in display order. Every UI surface that
// lists categories (sidebar, hero tabs) must read from here — adding
// a category is a single-file change.
export const CATEGORIES: readonly { key: ToolCategory; i18nKey: string }[] = [
  { key: 'crypto',  i18nKey: 'sidebar.category.crypto' },
  { key: 'dev',     i18nKey: 'sidebar.category.dev' },
  { key: 'convert', i18nKey: 'sidebar.category.convert' },
  { key: 'time',    i18nKey: 'sidebar.category.time' },
] as const

// A tab key may also be 'all' — the no-filter sentinel used by the
// hero tab strip and the home page's tool grid filter.
export type TabKey = 'all' | ToolCategory

export interface ToolDefinition {
  /** Canonical URL the user lands on; used by sidebar, tool card, search palette. */
  path: string
  /** Lazy-loaded component. */
  component: () => Promise<{ default: Component }>
  /** Key into `toolIconRegistry`. */
  icon: string
  /** i18n dot-path for the display name. */
  nameKey: string
  /** i18n dot-path for the description. */
  descKey: string
  /** Sidebar category. */
  category: ToolCategory
  /** Show the "NEW" badge on the home card. */
  isNew?: boolean
  /** Optional vue-router `props` — passed to the component as props. */
  props?: Record<string, unknown>
}

export const tools: readonly ToolDefinition[] = [
  // crypto
  { path: '/encryption/SM4', component: () => import('~/views/encryption/encryption.vue'), icon: 'shield',  nameKey: 'tools.sm4.name',      descKey: 'tools.sm4.desc',      category: 'crypto' },
  { path: '/encryption/AES', component: () => import('~/views/encryption/encryption.vue'), icon: 'key',     nameKey: 'tools.aes.name',      descKey: 'tools.aes.desc',      category: 'crypto' },
  { path: '/hash',            component: () => import('~/views/hash/hash.vue'),            icon: 'hash',    nameKey: 'tools.hash.name',     descKey: 'tools.hash.desc',     category: 'crypto' },
  { path: '/password-strength', component: () => import('~/views/password-strength/password-strength.vue'), icon: 'password', nameKey: 'tools.passwordStrength.name', descKey: 'tools.passwordStrength.desc', category: 'crypto' },
  // dev
  { path: '/json',          component: () => import('~/views/json/json.vue'),          icon: 'braces',   nameKey: 'tools.format.name',   descKey: 'tools.format.desc',   category: 'dev'},
  { path: '/sql',             component: () => import('~/views/sql/sql.vue'),              icon: 'database', nameKey: 'tools.sql.name',      descKey: 'tools.sql.desc',      category: 'dev' },
  { path: '/xml',             component: () => import('~/views/xml/xml.vue'),              icon: 'xml',      nameKey: 'tools.xml.name',      descKey: 'tools.xml.desc',      category: 'dev' },
  { path: '/contrast',        component: () => import('~/views/contrast/contrast.vue'),    icon: 'diff',     nameKey: 'tools.contrast.name', descKey: 'tools.contrast.desc', category: 'dev' },
  { path: '/text-stats',      component: () => import('~/views/text-stats/text-stats.vue'),  icon: 'bar',      nameKey: 'tools.textStats.name', descKey: 'tools.textStats.desc', category: 'dev' },
  { path: '/crontab',         component: () => import('~/views/crontab/crontab.vue'),        icon: 'cron',     nameKey: 'tools.crontab.name',   descKey: 'tools.crontab.desc',   category: 'dev' },
  // convert
  { path: '/base64',          component: () => import('~/views/base64/base64.vue'),         icon: 'binary',   nameKey: 'tools.base64.name',    descKey: 'tools.base64.desc',    category: 'convert' },
  { path: '/timestamp',       component: () => import('~/views/timestamp/timestamp.vue'),   icon: 'clock',    nameKey: 'tools.timestamp.name', descKey: 'tools.timestamp.desc', category: 'convert' },
  { path: '/color',           component: () => import('~/views/color/color.vue'),           icon: 'palette',  nameKey: 'tools.color.name',     descKey: 'tools.color.desc',     category: 'convert' },
  { path: '/qrcode',          component: () => import('~/views/qrcode/qrcode.vue'),         icon: 'qrcode',   nameKey: 'tools.qrcode.name',    descKey: 'tools.qrcode.desc',    category: 'convert' , isNew: true },
  // time
  { path: '/calendar',        component: () => import('~/views/calendar/calendar.vue'),    icon: 'calendar', nameKey: 'tools.calendar.name', descKey: 'tools.calendar.desc', category: 'time' },
  { path: '/timer',           component: () => import('~/views/timer/timer.vue'),          icon: 'timer',    nameKey: 'tools.timer.name',    descKey: 'tools.timer.desc',    category: 'time' },
] as const