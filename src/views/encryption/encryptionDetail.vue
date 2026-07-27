<!-- 加密详情组件，支持 SM4 和 AES 算法的加密解密操作 -->

<template>
  <div class="enc-detail">
    <!-- ============== Form (3fr 1fr, stack ≤992px) ============== -->
    <div class="enc-grid">
      <!-- ===== Left card: content + key + IV + result ===== -->
      <CardPane class="enc-card enc-card--main">
          <div class="enc-field">
            <label class="field-label">
              {{ t('encryptionPage.field.data') }}
            </label>
            <el-input
              v-model="form.data"
              type="textarea"
              :rows="6"
              resize="none"
              spellcheck="false"
              :placeholder="t('encryptionPage.placeholder.data')"
              class="enc-field__textarea"
            />
          </div>

          <div class="enc-field">
            <label class="field-label">
              {{ t('encryptionPage.field.key') }}
            </label>
            <el-input
              v-model="form.key"
              :placeholder="t('encryptionPage.placeholder.key')"
            />
          </div>

          <div class="enc-field">
            <label class="field-label">
              {{ t('encryptionPage.field.iv') }}
            </label>
            <el-input
              v-model="form.iv"
              :placeholder="t('encryptionPage.placeholder.iv')"
            />
          </div>

          <div class="enc-field enc-field--last">
            <label class="field-label">
              {{ t('encryptionPage.field.result') }}
            </label>
            <el-input
              v-model="form.result"
              type="textarea"
              :rows="6"
              resize="none"
              spellcheck="false"
              disabled
              :placeholder="t('encryptionPage.placeholder.result')"
              class="enc-field__textarea"
            />
          </div>
      </CardPane>

      <!-- ===== Right card: 4 config selects + 4 buttons ===== -->
      <CardPane class="enc-card enc-card--config">
          <div class="enc-field">
            <label class="field-label">
              {{ t('encryptionPage.field.dataType') }}
            </label>
            <el-select v-model="form.dataType">
              <el-option
                :label="t('encryptionPage.option.textDecodedAsBase64')"
                value="TEXT"
              />
              <el-option
                :label="t('encryptionPage.option.base64')"
                value="BASE64"
              />
              <el-option
                :label="t('encryptionPage.option.hex')"
                value="HEX"
              />
            </el-select>
          </div>

          <div class="enc-field">
            <label class="field-label">
              {{ t('encryptionPage.field.resultType') }}
            </label>
            <el-select v-model="form.resultType">
              <el-option
                :label="t('encryptionPage.option.textEncryptedAsBase64')"
                value="TEXT"
              />
              <el-option
                :label="t('encryptionPage.option.base64')"
                value="BASE64"
              />
              <el-option
                :label="t('encryptionPage.option.hex')"
                value="HEX"
              />
            </el-select>
          </div>

          <div class="enc-field">
            <label class="field-label">
              {{ t('encryptionPage.field.keyType') }}
            </label>
            <el-select v-model="form.keyType">
              <el-option
                :label="t('encryptionPage.option.base64')"
                value="BASE64"
              />
              <el-option
                :label="t('encryptionPage.option.hex')"
                value="HEX"
              />
            </el-select>
          </div>

          <div class="enc-field">
            <label class="field-label">
              {{ t('encryptionPage.field.mode') }}
            </label>
            <el-select v-model="form.mode">
              <el-option
                :label="t('encryptionPage.option.ecb')"
                value="ECB"
              />
              <el-option
                :label="t('encryptionPage.option.cbc')"
                value="CBC"
              />
              <el-option
                :label="t('encryptionPage.option.ctr')"
                value="CTR"
              />
            </el-select>
          </div>

          <div class="tool-actions tool-actions--stacked">
            <el-button type="success" @click="run('enc')">
              {{ t('encryptionPage.action.encrypt') }}
            </el-button>
            <el-button type="info" @click="run('dec')">
              {{ t('encryptionPage.action.decrypt') }}
            </el-button>
            <el-button
              type="primary"
              :disabled="!form.result"
              @click="copy(form.result)"
            >
              {{ t('encryptionPage.action.copy') }}
            </el-button>
            <el-button @click="clear">
              {{ t('encryptionPage.action.clear') }}
            </el-button>
          </div>
      </CardPane>
    </div>

    <!-- ============== Info blocks (no card headers — intro prose
         stands on its own, no need for a separate section title) ============== -->
    <section class="enc-info">
      <CardPane>
        <div class="enc-info__body prose-body">
          <p class="prose-para">
            <strong>{{ t('encryptionPage.info.introTitle') }}</strong>
          </p>
          <p
            v-for="(text, i) in encIntroParagraphs"
            :key="`ip-${i}`"
            class="prose-para"
            v-html="text"
          />
        </div>
      </CardPane>

      <CardPane>
        <div class="enc-info__body prose-body">
          <p class="prose-para">
            <strong>{{ t('encryptionPage.info.conceptsTitle') }}</strong>
          </p>
          <p
            v-for="(text, i) in encConceptParagraphs"
            :key="`cp-${i}`"
            class="prose-para"
            v-html="text"
          />
        </div>
      </CardPane>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import {
  sm4Encrypt,
  sm4Decrypt,
  aesEncrypt,
  aesDecrypt,
} from '~/utils/crypto'
import { useI18n } from 'vue-i18n'
import { useClipboard } from '~/composables/useClipboard'

// Use raw tm() for the prose arrays — t() flattens array paths into a
// single string and we need the full list to v-for over. Reading
// `locale.value` inside the computed establishes an explicit
// dependency on the active language so the array swaps on language
// flip.
const { t, tm, locale } = useI18n({ useScope: 'global' })
const { copy } = useClipboard()

const encIntroParagraphs = computed<string[]>(
  () => (locale.value, tm('encryptionPage.info.introParagraphs') as string[]),
)
const encConceptParagraphs = computed<string[]>(
  () => (locale.value, tm('encryptionPage.info.conceptParagraphs') as string[]),
)

const props = defineProps<{ algorithm: string }>()

const form = reactive({
  algorithmName: 'SM4' as 'SM4' | 'AES',
  data: '',
  key: '',
  iv: '',
  result: '',
  dataType: 'TEXT' as 'TEXT' | 'BASE64' | 'HEX',
  resultType: 'TEXT' as 'TEXT' | 'BASE64' | 'HEX',
  keyType: 'BASE64' as 'TEXT' | 'BASE64' | 'HEX',
  mode: 'ECB' as 'ECB' | 'CBC' | 'CTR',
})

function run(op: 'enc' | 'dec') {
  form.algorithmName = (props.algorithm as 'SM4' | 'AES') ?? 'SM4'
  try {
    const fn = form.algorithmName === 'AES'
      ? (op === 'enc' ? aesEncrypt : aesDecrypt)
      : (op === 'enc' ? sm4Encrypt : sm4Decrypt)
    form.result = fn({ ...form })
    ElMessage.success({
      message: op === 'enc'
        ? t('encryptionPage.message.encryptSuccess')
        : t('encryptionPage.message.decryptSuccess'),
    })
  } catch (e: unknown) {
    ElMessage.error({
      message: e instanceof Error ? e.message : t('encryptionPage.message.error'),
    })
  }
}

function clear() {
  form.data = ''
  form.key = ''
  form.iv = ''
  form.result = ''
}
</script>

<style lang="scss" scoped>
.enc-grid {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 16px;
  align-items: stretch;
}
@media (max-width: 900px) {
  .enc-grid {
    grid-template-columns: 1fr;
  }
}

.enc-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.enc-field--last {
  margin-bottom: 0;
}
.enc-field__textarea :deep(textarea) {
  font-family: var(--font-mono-code);
  font-size: 13px;
  line-height: 1.55;
}


.enc-info {
  margin-top: var(--tool-section-gap, 20px);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 末尾段落去掉下边距 — encryptionDetail 特有, 不抽到全局 */
.enc-info__body :deep(.prose-para:last-child) {
  margin-bottom: 0;
}

/* card-pane__body gap — 撑开 .enc-card 内 .enc-field 之间的间距 */
:deep(.card-pane__body) {
  gap: 10px;
}

/* ep-* 前缀来自 <el-config-provider namespace="ep">, select 在字段内全宽 */
.enc-field :deep(.ep-select) {
  width: 100% !important;
}
:deep(.ep-textarea__inner::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}
:deep(.ep-textarea__inner::-webkit-scrollbar-thumb) {
  border-radius: 3px;
  background-color: color-mix(in srgb, var(--it-text-tertiary) 60%, transparent);
}
:deep(.ep-textarea__inner::-webkit-scrollbar-track) {
  background-color: transparent;
}

@media (max-width: 600px) {
  .enc-info__body { padding: 14px 16px; }
}
</style>