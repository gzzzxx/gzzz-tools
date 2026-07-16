// useAutoFormat.ts — 防抖把源字符串 transform 后写回结果.
import { watch, type WatchSource } from 'vue'
import { useDebounceFn } from '@vueuse/core'

/**
 * 防抖地把 `format(getSource())` 写到 `writeResult`。
 * 空输入清空、format 抛错时静默保留旧值（避免打字中途闪错误态）。
 */
export function useAutoFormat(
  getSource: () => string,
  format: (input: string) => string,
  writeResult: (value: string) => void,
  options: { debounce?: number } = {},
) {
  const { debounce = 300 } = options
  const source: WatchSource<string> = getSource

  const run = useDebounceFn(() => {
    const input = getSource().trim()
    if (!input) {
      writeResult('')
      return
    }
    try {
      writeResult(format(input))
    } catch {
      /* keep previous result */
    }
  }, debounce)

  watch(source, run, { flush: 'post' })
}
