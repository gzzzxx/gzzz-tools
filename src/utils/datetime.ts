// datetime.ts — 工具页里重复的日期/时间格式化小函数集合.
//
// 抽取原则:
//   - 只抽在 ≥2 个文件里出现的小函数. 单文件独享的不动.
//   - 不引第三方库 (dayjs / date-fns). 工具页需求浅, native 够用.
//
// 当前内容:
//   - pad(n, len)           timestamp / timer 都在用, 数字前补 0
//   - formatDateTime(date)  timestamp 用, 'YYYY-MM-DD HH:mm:ss'
//
// 不动 ISO 8601 / RFC 2822 之类的国际化格式 — 暂时没需求, 引入了
// 也只是 dead code. 后面真要再加.

/** 数字前补 0 到指定长度 (默认 2). 用于时间字段格式化. */
export function pad(n: number, len = 2): string {
  return String(Math.floor(n)).padStart(len, '0')
}

/** 把 Date 格式化为 'YYYY-MM-DD HH:mm:ss'. 与原 timestamp.vue 100% 一致. */
export function formatDateTime(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
