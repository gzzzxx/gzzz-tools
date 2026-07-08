<!--
  xml.vue — XML pretty-printer / minifier.

  Style: card-based two-column layout (1fr | auto | 1fr) with
  a brand-colored arrow badge between source and result. Each
  card owns its header (title + contextual actions) so the
  controls sit next to what they act on (indent/clear → input,
  copy → output). Primary actions (Format / Minify) live in a
  centered top toolbar so the user sees what they can do
  before diving into either box.

  Deliberately *not* mirroring sql.vue's full-viewport dual-
  textarea layout. SQL is read top-to-bottom (long single-line
  queries); XML is read as a tree (multi-line nested structure).
  The two-column + arrow shape fits XML's "transform this input
  into this output" mental model better than SQL's "edit here,
  see there" split.
-->
<template>
  <ToolPage
    class="xml-page"
    preset="wide-editor"
    :title="t('tools.xml.name')"
    :subtitle="t('tools.xml.desc')"
  >

    <!-- Top action toolbar — sits above the input/output grid so
         the user sees what they can do before diving into either
         box. Format / Minify are the page's primary affordances;
         the smaller contextual controls (indent dropdown, clear,
         copy) live inside each card's header. Default-size buttons
         keep the toolbar compact so it doesn't crowd the cards
         below. -->
    <div class="tool-toolbar">
      <el-button type="primary" :icon="MagicStick" @click="format">
        {{ t('xmlPage.action.format') }}
      </el-button>
      <el-button :icon="Minus" @click="minify">
        {{ t('xmlPage.action.minify') }}
      </el-button>
    </div>

    <div class="tool-grid tool-grid--fullscreen">
      <!-- ============== Source card ============== -->
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

      <!-- ============== Result card ============== -->
      <CardPane class="xml-card" :title="t('xmlPage.section.result')" body-padding="0">
        <template #actions>
          <el-button
            size="small"
            :icon="DocumentCopy"
            link
            :disabled="!form.result"
            @click="copyData"
          >
            {{ t('xmlPage.action.copy') }}
          </el-button>
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
import { Delete, DocumentCopy, MagicStick, Minus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import xmlFormat from 'xml-formatter'
import { useI18n } from 'vue-i18n'
import { useClipboard } from '~/composables/useClipboard'

const { t } = useI18n({ useScope: 'global' })
const { copy } = useClipboard()

// Indentation choice — passed verbatim to xml-formatter's
// `indentation` option (it accepts any literal indent string).
type Indent = '  ' | '    ' | '\t'
const indent = ref<Indent>('  ')
const indentOptions = [
  { label: '2 spaces', value: '  ' },
  { label: '4 spaces', value: '    ' },
  { label: 'Tab',       value: '\t' },
] as const

const form = reactive({ data: '', result: '' })

// Single source of truth for the xml-formatter options used by
// both the explicit actions (Format / Minify) and the debounced
// auto-format. Keeping them in one place ensures a stale option
// can't drift between the three call sites.
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

// 先格式化再压空白，避免字符串字面量里的空白被误吃。
// xml-formatter 没有原生 minify，借用 sql.vue 的策略。
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

function copyData() {
  if (!form.result) {
    return ElMessage.warning({ message: t('xmlPage.error.copyEmpty') })
  }
  copy(form.result)
}

function clear() {
  form.data = ''
  form.result = ''
}

// 300ms 防抖自动格式化：左侧输入停顿后右侧自动出结果。
// 输入过程中 XML 可能不完整，xml-formatter 会抛错，
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

// Re-fire on either input change or indent switch (2 ↔ 4 ↔ tab)
// so the result pane always reflects the current state.
watch([() => form.data, indent], () => autoFormat(form.data), { flush: 'post' })
</script>

<style lang="scss" scoped>
/* Outer wrapper — wider than the standard 1200px (this is a
   horizontal two-pane tool, not a single-column form). Fixed
   height (not min-height) so the page never grows beyond the
   viewport and triggers a page-level scrollbar:
     height = 100vh - BaseHeader (56px) - top/bottom margin (16+16)
   overflow: hidden + box-sizing: border-box keep any inner
   overflow confined — textareas scroll internally.
   尺寸由 <ToolPage preset="wide-editor"> 提供; 这里只保留
   viewport-fixed 全屏双栏 (height / display / flex / overflow)。 */
.xml-page {
  // viewport-fixed 全屏双栏
  height: calc(100vh - 88px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* .tool-toolbar / .tool-grid(.tool-grid--fullscreen) 已抽到
   ~/styles/_tool-recipes.scss 全局 utility。
   模板里 <div class="tool-toolbar"> / <div class="tool-grid
   tool-grid--fullscreen"> 自动套用相同样式, 父 scoped 不用再写一份。 */

/* xml-card — same role as crontab.vue's .c-card: elevated bg +
   1px border + 4px radius. Plain section (not el-card) so we
   keep full control over the border + radius. */

/* .xml-card / .xml-card__header / .xml-card__title / .xml-card__actions
   块已抽到 ~/components/tools/CardPane.vue 组件 (全局 .card-pane /
   .card-pane__header / .card-pane__title / .card-pane__actions)。
   模板里 <CardPane class="xml-card" :title="..."> 自动套用相同样式,
   父 scoped 不用再写一份。 */

.xml-card__indent {
  /* Indent select 宽度 — 130px 保持原值, 移动端在 @media (max-width: 600px) 里改 110px。 */
  width: 130px;
}

/* 23 行 .xml-textarea 重复块 (display: flex / font / padding /
   border / box-shadow 等 fill-the-card + monospace 样式) 已抽到
   ~/components/tools/ToolTextarea.vue 组件, 父 scoped 不需要再写一份。 */

/* xml-specific select height tweak — small size select needs an
   explicit min-height (else EP wraps it weirdly with the toolbar
   buttons above). Caller-only rule, not shared. */
:deep(.ep-select--small .ep-select__wrapper) {
  min-height: 18px;
}

@media (max-width: 600px) {
  // .xml-page padding + .xml-title font-size 已由全局 _tool-page.scss 提供
  // .xml-card__header 移动端 padding 10 12 已由 <CardPane> 组件默认提供
  .xml-card__indent { width: 110px; }
}
</style>
