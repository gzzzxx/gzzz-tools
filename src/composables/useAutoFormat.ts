// useAutoFormat.ts — 防抖把源字符串 transform 后写回结果.
import { watch, type WatchSource } from 'vue'
import { useDebounceFn } from '@vueuse/core'

/**
 * 防抖地把 `format(getSource())` 写到 `writeResult`。
 * 空输入清空、format 抛错时静默保留旧值（避免打字中途闪错误态）。
 *
 * `getSource` 负责两件事：作为 watch 的依赖源，以及（默认情况下）
 * 作为待格式化的输入。当二者需要分开时，用 `options.getInput` 指定
 * 真正的输入 —— 例如 XML 工具的依赖源是 `data + '\0' + indent`，
 * 但真正要格式化的只有 `data`，否则那个分隔符会被当成 XML 的一部分
 * 送进 parser。
 */
export function useAutoFormat(
  getSource: () => string,
  format: (input: string) => string,
  writeResult: (value: string) => void,
  options: { debounce?: number; getInput?: () => string } = {},
) {
  const { debounce = 300 } = options
  const getInput = options.getInput ?? getSource
  const source: WatchSource<string> = getSource

  const run = useDebounceFn(() => {
    const input = getInput().trim()
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
