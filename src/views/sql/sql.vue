<!-- SQL 格式化/压缩工具，两栏卡片布局，支持自动格式化 -->

<template>
  <ToolPage
    class="sql-page tool-page--fullscreen"
    preset="wide-editor"
    :title="t('tools.sql.name')"
    :subtitle="t('tools.sql.desc')"
  >

    <div class="tool-toolbar">
      <el-button type="primary" :icon="MagicStick" @click="format">
        {{ t('sqlPage.action.format') }}
      </el-button>
      <el-button :icon="Minus" @click="minify">
        {{ t('sqlPage.action.minify') }}
      </el-button>
    </div>

    <div class="tool-grid tool-grid--fullscreen">
      <CardPane class="sql-card" :title="t('sqlPage.section.source')" body-padding="0">
        <template #actions>
          <el-button size="small" :icon="Delete" link @click="clear">
            {{ t('sqlPage.action.clear') }}
          </el-button>
        </template>
        <ToolTextarea
          v-model="form.data"
          :placeholder="t('sqlPage.input.placeholder')"
        />
      </CardPane>

      <CardPane class="sql-card" :title="t('sqlPage.section.result')" variant="result" body-padding="0">
        <template #actions>
          <CopyButton
            variant="text"
            :text="form.result"
          >
            {{ t('sqlPage.action.copy') }}
          </CopyButton>
        </template>
        <ToolTextarea
          v-model="form.result"
          :disabled="true"
          :placeholder="t('sqlPage.result.placeholder')"
        />
      </CardPane>
    </div>
  </ToolPage>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { Delete, MagicStick, Minus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { format as sqlFormat } from 'sql-formatter'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })

const FORMAT_OPTS = {
  language: 'sql',
  keywordCase: 'upper',
  tabWidth: 2,
  useTabs: false,
  indentStyle: 'standard',
  expressionWidth: 120,
  linesBetweenQueries: 2,
  denseOperators: false,
  newlineBeforeSemicolon: true,
}

const form = reactive({ data: '', result: '' })

function formatCore(input: string) {
  return sqlFormat(input, FORMAT_OPTS)
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
  runOnInput(formatCore, t('sqlPage.error.empty'))
}

// 先格式化再压缩空白，避免字符串字面量里的空白被误删
function minify() {
  runOnInput(
    input =>
      formatCore(input)
        .replace(/--[^\n]*/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\s*([(),;])\s*/g, '$1')
        .trim(),
    t('sqlPage.error.empty'),
  )
}

function clear() {
  form.data = ''
  form.result = ''
}

// 300ms 防抖自动格式化，输入过程中 SQL 不完整时静默忽略错误
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

watch(() => form.data, autoFormat)
</script>

<style lang="scss" scoped>
</style>
