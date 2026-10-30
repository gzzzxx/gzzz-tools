/*
 * js-calendar-converter.d.ts — 类型声明 for the vendored 农历转换库.
 *
 * The library ships plain ES5 JavaScript with no bundled types. Without
 * this declaration TypeScript infers `solar2lunar()` as
 * `-1 | { ... }` — the `-1` being its out-of-range error return — and
 * every property access on the result becomes an error.
 *
 * Only the surface the app actually uses is declared; the library has
 * ~20 more internal helpers (getFestival / toGanZhi / ...) that stay
 * untyped.
 */
export interface LunarDate {
  date: string
  lunarDate: string
  /** 公历节日名, 无则 null */
  festival: string | null
  /** 农历节日名, 无则 null */
  lunarFestival: string | null
  lYear: number
  lMonth: number
  lDay: number
  Animal: string
  /** 农历月中文, 如 "正月" / "闰四月" */
  IMonthCn: string
  /** 农历日中文, 如 "初一" */
  IDayCn: string
  cYear: number
  cMonth: number
  cDay: number
  gzYear: string
  gzMonth: string
  gzDay: string
  isToday: boolean
  isLeap: boolean
  nWeek: number
  ncWeek: string
  isTerm: boolean
  /** 节气名, 无则 null */
  Term: string | null
  /** 星座, 如 "水瓶座" */
  astro: string
}

export interface Calendar {
  /**
   * 公历 → 农历. 超出 1900-01-31 ~ 2100-12-01 区间返回 -1.
   * 参数按 `parseInt` 解析, 传字符串亦可.
   */
  solar2lunar(y: number | string, m: number | string, d: number | string): LunarDate | -1
  /** 农历 → 公历. 参数非法时返回 -1. */
  lunar2solar(y: number | string, m: number | string, d: number | string, isLeapMonth?: boolean): LunarDate | -1
}

declare const calendar: Calendar

export default calendar
