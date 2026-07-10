<!-- 二维码生成工具，支持文本/URL转二维码，实时预览和多种格式导出 -->

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

// 统一渲染配置，确保预览、下载和复制使用相同参数
const renderOpts = computed(() => ({
  errorCorrectionLevel: ecLevel.value,
  width: size.value,
  margin: margin.value,
  color: { dark: fg.value, light: bg.value },
}))

function toErrorMessage(e: unknown) {
  return e instanceof Error ? e.message : String(e)
}

// 实时预览：输入变化时重新渲染二维码
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
.q-form-row:has(.el-slider) {
  align-items: center;
}

/* Right card */
.q-card--preview {
  display: flex;
  flex-direction: column;
}

.q-preview-wrap {
  position: relative;
  min-height: 280px;
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-radius: 2px;
}

.q-error {
  color: var(--ep-color-danger);
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

@media (max-width: 600px) {
  .q-form-row .field-label { flex: 0 0 70px; font-size: 12px; }
  .q-preview-wrap { min-height: 220px; }
}
</style>
