// useClipboard.ts — 写剪贴板 + 自动 toast 的统一封装.
//
// 6 个工具页 (base64 / encryption / hash / sql / timestamp / xml) 都在做
// 完全一样的事:
//
//   navigator.clipboard.writeText(text).then(
//     () => ElMessage.success('已复制到剪贴板' / i18n key),
//     () => ElMessage.error('复制失败' / i18n key),
//   )
//
// 抽成 useClipboard 后, caller 只写一行:
//
//   const { copy } = useClipboard()
//   copy(form.result)
//
// i18n 已经在 composable 内部 useI18n({ useScope: 'global' }) 拿好,
// caller 不必再传 message 字符串. 文案继续走 i18n key
// (common.clipboard.success / common.clipboard.failed) — 这样未来
// 想加英文也只动 locales 文件, 不动 caller.
//
// i18n key 全部在 common.* 命名空间下 — common 是跨页面通用文案
// (theme toggle / sponsor / 这里的 clipboard toast 等), 跟具体
// 工具页无关.
//
// 返回值设计:
//   - copy(text)        写文本, 成功/失败各弹一次 ElMessage
//   - copyImage(blob)   写图片 (PNG). 内部用 ClipboardItem;
//                       不支持时回退到 ElMessage.warning 提示用户.
//
// 行为与原代码 100% 一致:
//   - success toast key: 'common.clipboard.success'
//   - failed  toast key: 'common.clipboard.failed'
//   - copyImage 不可用时 key: 'common.clipboard.imageUnsupported'

import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

export function useClipboard() {
  const { t } = useI18n({ useScope: 'global' })

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
