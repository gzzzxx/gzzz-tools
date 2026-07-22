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
            <strong>算法介绍</strong>
          </p>
          <p class="prose-para">
            <strong>SM4.0</strong>
            <span>（原名SMS4.0）是一种</span>
            <span class="prose-term">分组密码</span>
            <span>标准，由</span>
            <span class="prose-term">国家密码管理局</span>
            <span>于2012年3月21日发布。相关标准为"GM/T 0002-2012《SM4分组密码算法》（原SMS4分组密码算法）"。</span>
          </p>
          <p class="prose-para">
            <span>在</span>
            <span class="prose-term">商用密码</span>
            <span>体系中，SM4主要用于</span>
            <span class="prose-term">数据加密</span>
            <span>，其算法公开，分组长度与密钥长度均为128bit，</span>
            <span class="prose-term">加密算法</span>
            <span>与密钥扩展算法都采用32轮非线性迭代结构，</span>
            <span class="prose-term">S盒</span>
            <span>为固定的8比特输入8比特输出。</span>
          </p>
          <p class="prose-para">
            SM4.0中的指令长度被提升到大于64K（即64×1024）的水平，这是SM 3.0规格（渲染指令长度允许大于512）的128倍。
          </p>
        </div>
      </CardPane>

      <CardPane>
        <div class="enc-info__body prose-body">
          <p class="prose-para">
            <strong>相关概念</strong>
          </p>
          <p class="prose-para">
            <span>在</span>
            <span class="prose-term">密码学</span>
            <span>中，</span>
            <strong>分组加密</strong>
            <span>（英语：</span>
            <strong>Block cipher</strong>
            <span>），又称</span>
            <strong>分块加密</strong>
            <span>或</span>
            <strong>块密码</strong>
            <span>，是一种对称密钥算法。它将明文分成多个等长的模块（block），使用确定的算法和</span>
            <span class="prose-term">对称密钥</span>
            <span>对每组分别加密解密。分组加密是极其重要的加密协议组成，其中典型的如</span>
            <span class="prose-term">DES</span>
            <span>和</span>
            <span class="prose-term">AES</span>
            <span>作为美国政府核定的标准加密算法，应用领域从电子邮件加密到银行交易转帐，非常广泛。</span>
          </p>
          <p class="prose-para">
            国密即国家密码局认定的国产密码算法。主要有SM1，SM2，SM3，SM4。密钥长度和分组长度均为128位。
          </p>
          <p class="prose-para">
            SM1为对称加密。其加密强度与AES相当。该算法不公开，调用该算法时，需要通过加密芯片的接口进行调用。
          </p>
          <p class="prose-para">
            SM2为非对称加密，基于ECC。该算法已公开。由于该算法基于ECC，故其签名速度与秘钥生成速度都快于RSA。ECC 256位（SM2采用的就是ECC 256位的一种）安全强度比RSA 2048位高，但运算速度快于RSA。
          </p>
          <p class="prose-para">
            SM3消息摘要。可以用MD5作为对比理解。该算法已公开。校验结果为256位。
          </p>
          <p class="prose-para">
            SM4无线局域网标准的分组数据算法。对称加密，密钥长度和分组长度均为128位。
          </p>
        </div>
      </CardPane>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import {
  sm4Encrypt,
  sm4Decrypt,
  aesEncrypt,
  aesDecrypt,
} from '~/utils/crypto'
import { useT } from '~/composables/useT'
import { useClipboard } from '~/composables/useClipboard'

const { t } = useT()
const { copy } = useClipboard()

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