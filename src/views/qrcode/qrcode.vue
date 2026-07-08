<!--
  qrcode.vue — text/URL → QR code, with live canvas preview + PNG/SVG
  export + clipboard copy.

  Layout mirrors crontab.vue's two-card pattern: left card holds the
  text input + options (error-correction / size / margin / colors),
  right card holds the canvas preview + download buttons.

  Why qrcode (the npm lib) over hand-rolled encoding:
  - Mature, well-typed, ~25 KB gzipped (Vite picks lib/browser.js
    automatically via the package's `browser` field).
  - One library covers all three output formats we need:
    toCanvas (live preview), toDataURL (PNG download + clipboard),
    toString (SVG download). No need to ship two libs.

  Live preview: a single watch over the six input deps re-renders
  the canvas. qrcode encoding is sub-millisecond for typical text,
  so we don't bother debouncing — typing at 80 wpm still leaves the
  loop idle most of the time.
-->
<template>
  <ToolPage
    class="qrcode-page"
    preset="large-form"
    :title="t('tools.qrcode.name')"
    :subtitle="t('tools.qrcode.desc')"
  >

    <div class="qr-row">
      <!-- ============== Left: input + options ============== -->
      <CardPane class="q-card">
        <label class="field-label">{{ t('qrcodePage.input.label') }}</label>
        <el-input
          v-model="text"
          type="textarea"
          :rows="5"
          resize="none"
          :placeholder="t('qrcodePage.input.placeholder')"
          maxlength="2000"
          show-word-limit
        />

        <div class="tool-divider" />

        <div class="q-form">
          <div class="q-form-row">
            <label class="field-label">{{ t('qrcodePage.options.errorLevel') }}</label>
            <el-radio-group v-model="ecLevel" size="small">
              <el-radio-button
                v-for="lvl in (['L','M','Q','H'] as const)"
                :key="lvl"
                :value="lvl"
              >
                {{ t(`qrcodePage.errorLevel.${lvl}`) }}
              </el-radio-button>
            </el-radio-group>
          </div>

          <div class="q-form-row">
            <label class="field-label">{{ t('qrcodePage.options.size') }}</label>
            <el-slider v-model="size" :min="128" :max="512" :step="32" show-input />
          </div>

          <div class="q-form-row">
            <label class="field-label">{{ t('qrcodePage.options.margin') }}</label>
            <el-slider v-model="margin" :min="0" :max="8" :step="1" show-input />
          </div>

          <div class="q-form-row">
            <label class="field-label">{{ t('qrcodePage.options.fg') }}</label>
            <el-color-picker v-model="fg" />
          </div>

          <div class="q-form-row">
            <label class="field-label">{{ t('qrcodePage.options.bg') }}</label>
            <el-color-picker v-model="bg" />
          </div>
        </div>
      </CardPane>

      <!-- ============== Right: preview + actions ============== -->
      <CardPane class="q-card q-card--preview">
        <div class="q-preview-wrap">
          <canvas v-show="hasContent" ref="canvasRef" class="q-canvas" />
          <EmptyState v-if="!hasContent" padding="0">
            {{ t('qrcodePage.empty') }}
          </EmptyState>
          <div v-if="errorMsg" class="q-error">
            {{ errorMsg }}
          </div>
        </div>

        <div class="q-meta">
          <span v-if="moduleCount">{{ t('qrcodePage.moduleCount', { n: moduleCount }) }}</span>
        </div>

        <div class="tool-divider" />

        <div class="tool-actions tool-actions--gap-sm">
          <el-button :icon="Download" @click="downloadPng" :disabled="!hasContent">
            {{ t('qrcodePage.action.downloadPng') }}
          </el-button>
          <el-button :icon="Files" @click="downloadSvg" :disabled="!hasContent">
            {{ t('qrcodePage.action.downloadSvg') }}
          </el-button>
          <el-button :icon="CopyDocument" @click="copyImage" :disabled="!hasContent">
            {{ t('qrcodePage.action.copy') }}
          </el-button>
        </div>
      </CardPane>
    </div>
  </ToolPage>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import QRCode, { type QRCodeErrorCorrectionLevel } from 'qrcode'
import { ElMessage } from 'element-plus'
import { CopyDocument, Download, Files } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { useClipboard } from '~/composables/useClipboard'

const { t } = useI18n({ useScope: 'global' })
const clipboard = useClipboard()

// Reactive inputs

const text = ref('')
const ecLevel = ref<QRCodeErrorCorrectionLevel>('M')
const size = ref(256)
const margin = ref(2)
const fg = ref('#000000')
const bg = ref('#ffffff')

const canvasRef = ref<HTMLCanvasElement | null>(null)
const errorMsg = ref('')
const moduleCount = ref(0)

const hasContent = computed(() => text.value.trim().length > 0)

// Shared render options — single source of truth so live preview,
// PNG download, SVG download, and clipboard copy all match.
const renderOpts = computed(() => ({
  errorCorrectionLevel: ecLevel.value,
  width: size.value,
  margin: margin.value,
  color: { dark: fg.value, light: bg.value },
}))

function toErrorMessage(e: unknown) {
  return e instanceof Error ? e.message : String(e)
}

// Live preview: render on first mount + on any input change.
// qrcode throws if the text is too long for the chosen error-
// correction level — we surface that as inline feedback instead
// of crashing the page.
watch(
  [text, renderOpts],
  async () => {
    errorMsg.value = ''
    moduleCount.value = 0
    if (!hasContent.value) return
    await nextTick()
    const canvas = canvasRef.value
    if (!canvas) return
    try {
      // QRCode.create() returns the matrix without drawing it;
      // we read modules.size for the diagnostic label, then
      // render via toCanvas for the visible preview. Sharing
      // the same options object between the two guarantees the
      // label matches what the user sees.
      const matrix = QRCode.create(text.value, renderOpts.value)
      moduleCount.value = matrix.modules.size
      await QRCode.toCanvas(canvas, text.value, renderOpts.value)
    } catch (e) {
      errorMsg.value = toErrorMessage(e)
    }
  },
  { immediate: true },
)

// Downloads + clipboard copy

async function getPngBlob() {
  const dataUrl = await QRCode.toDataURL(text.value, renderOpts.value)
  return (await fetch(dataUrl)).blob()
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // Defer revoke so Safari has time to start the download
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

async function downloadPng() {
  try {
    triggerDownload(await getPngBlob(), 'qrcode.png')
  } catch (e) {
    ElMessage.error(toErrorMessage(e))
  }
}

async function downloadSvg() {
  try {
    const svg = await QRCode.toString(text.value, { ...renderOpts.value, type: 'svg' })
    triggerDownload(new Blob([svg], { type: 'image/svg+xml' }), 'qrcode.svg')
  } catch (e) {
    ElMessage.error(toErrorMessage(e))
  }
}

async function copyImage() {
  await clipboard.copyImage(getPngBlob)
}
</script>

<style lang="scss" scoped>
/* Page-level wrapper sizing is provided by <ToolPage preset="large-form">. */
/* Two-card row — stretch (default) so left/right CardPane 等高,
   跟左栏内容多时右栏不再"挂底部". 旧 align-items: start 改 stretch
   是为了配合下面 .q-preview-wrap { flex: 1 } 把 canvas 居中显示. */
.qr-row {
  display: grid;
  grid-template-columns: 5fr 7fr;
  gap: 16px;
}
@media (max-width: 900px) {
  .qr-row {
    grid-template-columns: 1fr;
  }
}

/* q-card 容器 — 背景 / 边框 / 圆角 / 20-24 padding 已抽到
   ~/components/tools/CardPane.vue 组件 (bodyPadding="20px 24px"),
   这里不需要再写一份。.q-card 只保留特异样式 (无 — 之前也没有
   .q-card 自身的特异样式, 全部样式来自 .q-card > 内部元素)。 */

/* Left card */
/* .field-label 已抽到 ~/styles/_tool-recipes.scss 全局 utility (13/600/
   primary + 8px margin-bottom)。模板里 <label class="field-label"> 自动
   套用, 这里只保留 horizontal layout 的特异值 (固定宽 90px + 取消
   .field-label 默认的 8px margin-bottom — row layout 不需要)。
   移动端缩窄到 70px 在底部 @media 内统一处理。 */
.q-form-row .field-label {
  flex: 0 0 90px;
  margin-bottom: 0;
}

.q-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.q-form-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 32px;
}
/* Slider row needs vertical centering so the input chip aligns
   with the slider track. */
.q-form-row:has(.el-slider) {
  align-items: center;
}

/* Right card */
.q-card--preview {
  display: flex;
  flex-direction: column;
}

/* Checkerboard bg so light-on-light QR mistakes are visible. */
.q-preview-wrap {
  position: relative;
  min-height: 280px;
  /* flex: 1 让 preview-wrap 吃满 CardPane body 的剩余高度 —
     配合 .qr-row 的 stretch 把右栏拉到与左栏等高, canvas
     视觉上居中显示 (meta + actions 沉底). */
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image:
    linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 16px 16px;
  background-position: 0 0, 0 8px, 8px -8px, -8px 0;
  border-radius: 4px;
  padding: 16px;
  box-sizing: border-box;
}

.q-canvas {
  display: block;
  max-width: 100%;
  height: auto;
  /* Shadow so the QR lifts off the checkerboard even when its
     colors match the page bg. */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-radius: 2px;
}

.q-error {
  color: var(--el-color-danger);
  font-size: 13px;
  text-align: center;
  margin-top: 12px;
}

.q-meta {
  margin-top: 8px;
  font-size: 12px;
  color: var(--it-text-tertiary);
  text-align: center;
}

/* .q-divider / .q-actions / .q-empty 已分别抽到 ~/styles/_tool-recipes.scss
   (.tool-divider / .tool-actions.tool-actions--gap-sm) 和
   ~/components/tools/EmptyState.vue 组件。模板里
   <div class="tool-divider"> / <div class="tool-actions tool-actions--gap-sm">
   / <EmptyState padding="0"> 自动套用相同样式, 父 scoped 不用再写一份。 */

@media (max-width: 600px) {
  .q-form-row .field-label { flex: 0 0 70px; font-size: 12px; }
  .q-preview-wrap { min-height: 220px; }
}
</style>
