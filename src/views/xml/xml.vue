<!-- XML 格式化/压缩工具，两栏卡片布局，支持自动格式化 -->

<template>
  <ToolPage
    class="xml-page tool-page--fullscreen"
    preset="wide-editor"
    :title="t('tools.xml.name')"
    :subtitle="t('tools.xml.desc')"
  >

    <!-- 顶部操作栏 -->
    <div class="tool-toolbar">
      <el-button type="primary" :icon="MagicStick" @click="format">
        {{ t('xmlPage.action.format') }}
      </el-button>
      <el-button :icon="Minus" @click="minify">
        {{ t('xmlPage.action.minify') }}
      </el-button>
    </div>

    <div class="tool-grid tool-grid--fullscreen">
      <!-- 源输入卡片 -->
      <CardPane class="xml-card" :title="t('xmlPage.section.source')" body-padding="0">
        <template #actions>
          <el-select v-model="indent" size="small" class="xml-card__indent">
            <el-option
              v-for="o in indentOptions"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
          </el-select>
          <el-button size="small" :icon="Delete" link @click="clear">
            {{ t('xmlPage.action.clear') }}
          </el-button>
        </template>
        <ToolTextarea
          v-model="form.data"
          :placeholder="t('xmlPage.input.placeholder')"
        />
      </CardPane>

      <!-- 结果输出卡片 -->
      <CardPane class="xml-card" :title="t('xmlPage.section.result')" variant="result" body-padding="0">
        <template #actions>
          <CopyButton
            variant="text"
            :text="form.result"
          >
            {{ t('xmlPage.action.copy') }}
          </CopyButton>
        </template>
        <ToolTextarea
          v-model="form.result"
          :disabled="true"
          :placeholder="t('xmlPage.result.placeholder')"
        />
      </CardPane>
    </div>
  </ToolPage>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { Delete, MagicStick, Minus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import xmlFormat from 'xml-formatter'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })

type Indent = '  ' | '    ' | '\t'
const indent = ref<Indent>('  ')
const indentOptions = [
  { label: '2 spaces', value: '  ' },
  { label: '4 spaces', value: '    ' },
  { label: 'Tab',       value: '\t' },
] as const

const form = reactive({ data: '', result: '' })

function formatCore(input: string) {
  return xmlFormat(input, {
    indentation: indent.value,
    collapseContent: true,
    throwOnFailure: true,
  })
}

function runOnInput(action: (input: string) => string, emptyMsg: string) {
  const input = form.data.trim()
  if (!input) {
    ElMessage.warning({ message: emptyMsg })
    form.result = ''
    return
  }
  try {
    form.result = action(input)
  } catch (e) {
    form.result = e instanceof Error ? e.message : String(e)
  }
}

function format() {
  runOnInput(formatCore, t('xmlPage.error.empty'))
}

// 先格式化再压缩空白，避免字符串字面量里的空白被误删
function minify() {
  runOnInput(
    input =>
      formatCore(input)
        .replace(/>\s+</g, '><')
        .replace(/\s+/g, ' ')
        .replace(/>\s+(\S)/g, '>$1')
        .replace(/(\S)\s+</g, '$1<')
        .trim(),
    t('xmlPage.error.empty'),
  )
}

function clear() {
  form.data = ''
  form.result = ''
}

// 300ms 防抖自动格式化，输入过程中 XML 不完整时静默忽略错误
const autoFormat = useDebounceFn((value: string) => {
  const input = value.trim()
  if (!input) {
    form.result = ''
    return
  }
  try {
    form.result = formatCore(input)
  } catch {
    /* keep previous result */
  }
}, 300)

watch([() => form.data, indent], () => autoFormat(form.data), { flush: 'post' })
</script>

<style lang="scss" scoped>

.xml-card__indent {
  width: 130px;
}

:deep(.ep-select--small .ep-select__wrapper) {
  min-height: 18px;
}

@media (max-width: 600px) {
  .xml-card__indent { width: 110px; }
}
</style>
