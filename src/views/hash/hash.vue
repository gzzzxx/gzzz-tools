<!-- Hash 哈希计算工具，支持 MD5/SHA-1/SHA-256/SHA-384/SHA-512 -->

<template>
  <ToolPage
    class="hash-page"
    preset="medium-form"
    :title="t('tools.hash.name')"
    :subtitle="t('tools.hash.desc')"
  >
    <CardPane class="input-card">
      <el-input
        v-model="input"
        type="textarea"
        :rows="6"
        :placeholder="t('hashPage.input.placeholder')"
        resize="none"
        clearable
      />
      <div class="input-meta">
        <span>{{ t('hashPage.input.charCount', { n: input.length }) }}</span>
        <el-button :icon="Delete" size="small" @click="input = ''">
          {{ t('hashPage.input.clear') }}
        </el-button>
      </div>
    </CardPane>

    <!-- 结果列表 -->
    <div class="result-list">
      <CardPane
        v-for="algo in algorithms"
        :key="algo.key"
        class="result-card"
        :class="{ 'is-empty': !input }"
        variant="result"
        body-padding="10px"
      >
        <div class="result-row-flex">
          <div class="result-info">
            <div class="result-label">
              {{ algo.label }}
              <span class="result-bits">{{ t('hashPage.result.bits', { n: algo.bits }) }}</span>
            </div>
            <div
              class="result-value result-mono"
              :class="{ 'result-value--wraps': algo.key === 'sha384' || algo.key === 'sha512' }"
            >
              {{ input ? results[algo.key] : '—' }}
            </div>
          </div>
          <el-button
            :icon="DocumentCopy"
            size="small"
            circle
            :disabled="!input || !results[algo.key]"
            @click="copy(algo.key)"
          />
        </div>
      </CardPane>
    </div>
  </ToolPage>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { Delete, DocumentCopy } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { md5 } from '~/utils/md5'
import { useClipboard } from '~/composables/useClipboard'

interface HashResults {
  md5: string
  sha1: string
  sha256: string
  sha384: string
  sha512: string
}

const algorithms: { key: keyof HashResults; label: string; bits: number }[] = [
  { key: 'md5',    label: 'MD5',     bits: 128 },
  { key: 'sha1',   label: 'SHA-1',   bits: 160 },
  { key: 'sha256', label: 'SHA-256', bits: 256 },
  { key: 'sha384', label: 'SHA-384', bits: 384 },
  { key: 'sha512', label: 'SHA-512', bits: 512 },
]

const { t } = useI18n({ useScope: 'global' })
const clipboard = useClipboard()

const input = ref('')
const results = reactive<HashResults>({
  md5: '',
  sha1: '',
  sha256: '',
  sha384: '',
  sha512: '',
})

async function sha(algo: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512', text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest(algo, bytes)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

watch(input, async (text) => {
  if (!text) {
    results.md5 = results.sha1 = results.sha256 = results.sha384 = results.sha512 = ''
    return
  }
  results.md5 = md5(text)
  const [sha1, sha256, sha384, sha512] = await Promise.all([
    sha('SHA-1',   text),
    sha('SHA-256', text),
    sha('SHA-384', text),
    sha('SHA-512', text),
  ])
  if (input.value !== text) return
  results.sha1 = sha1
  results.sha256 = sha256
  results.sha384 = sha384
  results.sha512 = sha512
})

function copy(key: keyof HashResults) {
  const value = results[key]
  if (!value) return
  clipboard.copy(value)
}
</script>

<style lang="scss" scoped>
.input-card {
  margin-bottom: var(--tool-section-gap, 20px);
}

.result-list {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-card.is-empty { opacity: 0.6; }

.result-row-flex {
  display: flex;
  align-items: center;
  gap: 12px;
}

.result-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.result-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--it-text-primary);
}

.result-bits {
  margin-left: 8px;
  font-size: 12px;
  font-weight: 400;
  color: var(--it-text-secondary);
}

.result-value {
  line-height: 1.4;
  word-break: break-all;
  user-select: all;
}

.result-value--wraps {
  min-height: 2.8em;
  box-sizing: border-box;
}
</style>
