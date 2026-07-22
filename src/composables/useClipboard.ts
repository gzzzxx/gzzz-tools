// useClipboard.ts — 写剪贴板 + 自动 toast 的统一封装.
import { ElMessage } from 'element-plus'
import { useT } from './useT'

export function useClipboard() {
  const { t } = useT()

  function copy(text: string) {
    if (!text) return
    navigator.clipboard.writeText(text).then(
      () => ElMessage.success(t('common.clipboard.success')),
      () => ElMessage.error(t('common.clipboard.failed')),
    )
  }

  async function copyImage(getBlob: () => Promise<Blob>) {
    if (typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) {
      ElMessage.warning(t('common.clipboard.imageUnsupported'))
      return
    }
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': await getBlob() }),
      ])
      ElMessage.success(t('common.clipboard.success'))
    } catch {
      ElMessage.error(t('common.clipboard.failed'))
    }
  }

  return { copy, copyImage }
}
