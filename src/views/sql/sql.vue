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

    <div class="sql-toolbar">
      <el-button type="primary" :icon="MagicStick" @click="format">
        {{ t('sqlPage.action.format') }}
      </el-button>
      <el-button :icon="Minus" @click="minify">
        {{ t('sqlPage.action.minify') }}
      </el-button>
    </div>

    <div class="sql-grid">
      <CardPane class="sql-card" :title="t('sqlPage.section.source')">
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

      <CardPane class="sql-card" :title="t('sqlPage.section.result')">
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

<script lang="ts" setup>
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
   flex-direction: column lets .sql-grid grow with flex:1.
   尺寸由 <ToolPage preset="wide-editor"> 提供; 这里只保留
   viewport-fixed 全屏双栏 (height / display / flex / overflow)。 */
.sql-page {
  // viewport-fixed 全屏双栏
  height: calc(100vh - 88px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Top toolbar. Button horizontal padding tightened from the
   Element Plus default 15px to 10px — for 2-3 char labels the
   default padding leaves the buttons looking loose, even at
   default size. */
.sql-toolbar {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 14px;
}
.sql-toolbar :deep(.ep-button) {
  padding-left: 10px;
  padding-right: 10px;
}

/* Two-card row. flex:1 + min-height:0 so the cards eat the
   leftover vertical space; align-items stretch is the default
   — cards inherit the row's height, then their textarea fills
   the card via its own flex chain. 1fr 1fr (no center column)
   to match the JSON formatter's "equal width, no arrow" style
   — the input/output relationship is implied by left/right
   positioning alone, and dropping the arrow gives both cards
   ~40px more horizontal space. */
.sql-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: stretch;
  flex: 1;
  min-height: 0;
}
@media (max-width: 900px) {
  .sql-grid {
    grid-template-columns: 1fr;
  }
}

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

@media (max-width: 600px) {
  // .sql-page padding + .sql-title font-size 已由全局 _tool-page.scss 提供
  // .sql-card__header 移动端 padding 10 12 已由 <CardPane> 组件
  //   headerMobilePadding="10px 12px" 默认值提供 — 不再需要在
  //   caller scoped 块里写一份冗余规则 (抽 CardPane 之前是必要的)
  .sql-toolbar { gap: 12px; }
}
</style>
