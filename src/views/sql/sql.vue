<!--
  sql.vue — SQL pretty-printer / minifier.

  Layout: same card-based two-column pattern as xml.vue (1fr |
  auto | 1fr with a brand-colored arrow badge between source
  and result). Each card owns its header — Clear lives with the
  source, Copy lives with the result — so the controls sit
  next to what they act on. Format / Minify stay in a top
  toolbar as the page's primary affordances.

  This used to be sql.vue's "full-viewport dual-textarea"
  layout (mirroring what most SQL formatters do online). It
  was deliberately rebuilt to match the rest of the dev
  category so /format /sql /xml all feel like one family.
-->
<template>
  <ToolPage
    class="sql-page"
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

      <CardPane class="sql-card" :title="t('sqlPage.section.result')" body-padding="0">
        <template #actions>
          <el-button
            size="small"
            :icon="DocumentCopy"
            link
            :disabled="!form.result"
            @click="copyData"
          >
            {{ t('sqlPage.action.copy') }}
          </el-button>
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
import { Delete, DocumentCopy, MagicStick, Minus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { format as sqlFormat } from 'sql-formatter'
import { useI18n } from 'vue-i18n'
import { useClipboard } from '~/composables/useClipboard'

const { t } = useI18n({ useScope: 'global' })
const { copy } = useClipboard()

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

// Single source of truth for the sql-formatter options used by
// both the explicit actions and the debounced auto-format.
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

// 先格式化再压空白，避免字符串字面量里的空白被误吃。
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

function copyData() {
  if (!form.result) {
    return ElMessage.warning({ message: t('sqlPage.error.copyEmpty') })
  }
  copy(form.result)
}

function clear() {
  form.data = ''
  form.result = ''
}

// 300ms 防抖自动格式化：左侧输入停顿后右侧自动出结果。
// 输入过程中 SQL 可能不完整，sql-formatter 偶尔会抛错，
// 这种情况下静默忽略、保留上次有效结果，避免右侧闪烁报错。
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
/* Outer wrapper — same shape as xml.vue: wide (1600px) for a
   horizontal two-pane tool, viewport-fixed so the page never
   triggers a page-level scrollbar (height = 100vh - header -
   page margins, with overflow:hidden to clip inner overflow).
   flex-direction: column lets .tool-grid--fullscreen grow with flex:1.
   尺寸由 <ToolPage preset="wide-editor"> 提供; 这里只保留
   viewport-fixed 全屏双栏 (height / display / flex / overflow)。 */
.sql-page {
  // viewport-fixed 全屏双栏
  height: calc(100vh - 88px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* .tool-toolbar / .tool-grid(.tool-grid--fullscreen) 已抽到
   ~/styles/_tool-recipes.scss 组件 (全局 utility)。
   模板里 <div class="tool-toolbar"> / <div class="tool-grid
   tool-grid--fullscreen"> 自动套用相同样式, 父 scoped 不用再写一份。 */

/* .sql-card / .sql-card__header / .sql-card__title / .sql-card__actions
   块已抽到 ~/components/tools/CardPane.vue 组件 (全局 .card-pane /
   .card-pane__header / .card-pane__title / .card-pane__actions)。
   模板里 <CardPane class="sql-card" :title="..."> 自动套用相同样式,
   父 scoped 不用再写一份。 */

/* 23 行 .sql-textarea 重复块 (display: flex / font / padding /
   border / box-shadow 等 fill-the-card + monospace 样式) 已抽到
   ~/components/tools/ToolTextarea.vue 组件, 父 scoped 不需要再写一份。 */

/* Arrow badge removed — matches the JSON formatter's equal-
   width "no arrow" style. */
</style>
