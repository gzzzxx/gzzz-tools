<!--
  contrast.vue — code/text diff viewer.

  Same card-based layout family as sql.vue / xml.vue / json.vue:
    .contrast-page  → max-width centered shell, soft shadow
    .contrast-toolbar → page-level settings (language / mode / folding)
    .contrast-grid  → 1fr 1fr (collapses to 1fr ≤900px) for the two
                       input cards — "Original" + "Modified"
    .contrast-result → full-width card holding the vue-diff output

  Two-card pattern is the same as the formatters: each card owns its
  header (title + Clear button), the textarea fills the card via
  flex:1 (el-input's auto-height is overridden through :deep()), and
  the result card sits below as a separate block so the diff itself
  can render at its natural height without squeezing the inputs.

  Theme sync stays identical to the original — vue-diff applies
  `vue-diff-theme-{dark|light}` + `vue-diff-mode-{mode}` on its
  outer wrapper, but the theme prop alone doesn't always repaint
  after the user toggles dark mode later in the session, so we
  re-write the wrapper className on every (isDark, mode) change.
-->
<template>
  <ToolPage
    class="contrast-page"
    :title="t('tools.contrast.name')"
    :subtitle="t('tools.contrast.desc')"
  >

    <div class="contrast-toolbar">
      <div class="contrast-toolbar__group">
        <label class="contrast-toolbar__label">
          {{ t('contrastPage.options.type') }}
        </label>
        <el-select v-model="form.type" size="small" class="contrast-toolbar__select">
          <el-option
            v-for="o in languageOptions"
            :key="o.value"
            :label="o.label"
            :value="o.value"
          />
        </el-select>
      </div>

      <div class="contrast-toolbar__group">
        <label class="contrast-toolbar__label">
          {{ t('contrastPage.options.mode') }}
        </label>
        <el-radio-group v-model="form.mode" size="small">
          <el-radio-button value="split">
            {{ t('contrastPage.options.modeSplit') }}
          </el-radio-button>
          <el-radio-button value="unified">
            {{ t('contrastPage.options.modeUnified') }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <el-tooltip
        :content="t('contrastPage.options.foldingHint')"
        placement="top"
      >
        <div class="contrast-toolbar__group contrast-toolbar__group--switch">
          <el-switch v-model="form.folding" />
          <span class="contrast-toolbar__hint">
            {{ t('contrastPage.options.folding') }}
          </span>
        </div>
      </el-tooltip>
    </div>

    <div class="contrast-grid">
      <CardPane class="contrast-card" :title="t('contrastPage.section.prev')">
        <template #actions>
          <el-button size="small" :icon="Delete" link @click="form.prev = ''">
            {{ t('contrastPage.action.clear') }}
          </el-button>
        </template>
        <ToolTextarea
          v-model="form.prev"
          :rows="10"
          :placeholder="t('contrastPage.input.placeholder.prev')"
        />
      </CardPane>

      <CardPane class="contrast-card" :title="t('contrastPage.section.current')">
        <template #actions>
          <el-button size="small" :icon="Delete" link @click="form.current = ''">
            {{ t('contrastPage.action.clear') }}
          </el-button>
        </template>
        <ToolTextarea
          v-model="form.current"
          :rows="10"
          :placeholder="t('contrastPage.input.placeholder.current')"
        />
      </CardPane>
    </div>

    <CardPane class="contrast-result" :title="t('contrastPage.section.result')">
      <Diff
        id="diff"
        :mode="form.mode"
        :theme="theme"
        :language="form.type"
        :prev="form.prev"
        :current="form.current"
        :folding="form.folding"
      />
    </CardPane>
  </ToolPage>
</template>

<script lang="ts" setup>
import { computed, nextTick, reactive, watch } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { useIsDark } from '~/composables/useIsDark'

const { t } = useI18n({ useScope: 'global' })
const isDark = useIsDark()

// Theme follows the site-wide toggle. vue-diff applies its colors via the
// vue-diff-theme-{dark|light} class on the wrapper, so we keep that in sync
// here too — the prop alone doesn't repaint when the user toggles later.
const theme = computed(() => (isDark.value ? 'dark' : 'light'))

// Language options — labels stay as the canonical identifier (technical
// names, no translation) since they're identifiers passed verbatim to
// highlight.js. The dropdown keeps the technical spelling in both locales
// so the same value round-trips to `form.type`.
const languageOptions = [
  { label: 'CSS',        value: 'css' },
  { label: 'XML',        value: 'xml' },
  { label: 'Markdown',   value: 'markdown' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'JSON',       value: 'json' },
  { label: 'Plaintext',  value: 'plaintext' },
  { label: 'TypeScript', value: 'typescript' },
] as const

const form = reactive({
  type: 'plaintext',
  mode: 'split' as 'split' | 'unified',
  prev: '',
  current: '',
  folding: false,
})

// Re-write the vue-diff wrapper's className on (theme, mode) changes —
// vue-diff binds these via h() inside its render function so they
// *should* be reactive, but in practice the wrapper class doesn't
// always repaint after a late dark-mode toggle, so we set it directly.
watch(
  [isDark, () => form.mode],
  ([dark, mode]) => {
    nextTick(() => {
      const d = document.getElementById('diff')
      if (d) {
        d.className = `vue-diff-wrapper vue-diff-mode-${mode} vue-diff-theme-${dark ? 'dark' : 'light'}`
      }
    })
  },
  { immediate: true, flush: 'post' },
)
</script>

<style lang="scss" scoped>
/* Outer wrapper — same shape as sql.vue / xml.vue / json.vue: wide
   (1600px) centered shell with a soft drop shadow. No fixed height
   here (unlike sql.vue) because the diff result can be tall and
   shouldn't squeeze the two input cards above; the page grows with
   content and the browser scrolls naturally.
   标题 / 副标题的字体 + 移动端 padding + 外壳 background/border-radius
   / box-shadow 已抽到 ~/components/tools/ToolPage.vue + ~/styles/_tool-page.scss,
   这里只保留 contrast 特有的 sizing (通过 CSS 变量覆盖默认值):
     - max-width: 1600px
     - margin-y: 16px
     - padding: 20px 16px
     - subtitle margin-bottom: 20px */
.contrast-page {
  --tool-page-max-width: 1600px;
  --tool-page-margin-y: 16px;
  --tool-page-padding: 20px 16px;
  --tool-page-subtitle-mb: 20px;
}

/* Toolbar — page-level settings (language / mode / folding). Sits
   in its own elevated strip so the controls feel like "settings",
   not like primary actions on the data. Uses an inline label +
   control pair (label-on-left) so the group is self-explanatory
   without needing a separate card chrome around it. */
.contrast-toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 18px;
  padding: 10px 16px;
  margin-bottom: 14px;
  background-color: var(--it-bg-elevated);
  border: 1px solid var(--it-border);
  border-radius: 4px;
}
.contrast-toolbar__group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.contrast-toolbar__group--switch {
  gap: 6px;
}
.contrast-toolbar__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--it-text-primary);
  white-space: nowrap;
}
.contrast-toolbar__hint {
  font-size: 13px;
  color: var(--it-text-secondary);
  white-space: nowrap;
}
.contrast-toolbar__select {
  width: 140px;
}

/* Two-card input row. 1fr 1fr matches the formatter pattern; below
   900px collapses to a single column so each card gets the full
   width on mobile. align-items: stretch is the default so both
   cards share the row's height — and the textareas inside fill
   their cards via the flex chain below. */
.contrast-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: stretch;
}
@media (max-width: 900px) {
  .contrast-grid {
    grid-template-columns: 1fr;
  }
}

/* Card + header — identical pattern to .sql-card / .xml-card. Plain
   section (not el-card) so we keep full control over border + radius,
   and so the textarea's flex-grow isn't fighting an extra wrapper. */
.contrast-card {
  display: flex;
  flex-direction: column;
  background-color: var(--it-bg-elevated);
  border: 1px solid var(--it-border);
  border-radius: 4px;
  overflow: hidden;
}

/* .contrast-card / .contrast-card__header / .contrast-card__title /
   .contrast-card__actions / .contrast-result / .contrast-result__header
   / .contrast-result__title 块已抽到 ~/components/tools/CardPane.vue
   组件 (全局 .card-pane / .card-pane__header / .card-pane__title /
   .card-pane__actions)。模板里 <CardPane class="contrast-card"
   :title="..."> / <CardPane class="contrast-result" :title="...">
   自动套用相同样式, 父 scoped 不用再写一份。 */

/* .contrast-textarea 23 行重复块已抽到 ~/components/tools/ToolTextarea.vue
   组件 (display: flex / font / padding / border / box-shadow 等
   fill-the-card + monospace 样式)。模板里 <ToolTextarea v-model="..."
   :rows="10"> 自动套用相同样式, 父 scoped 不用再写一份。 */

/* Result card — full-width strip below the input grid. 容器 / header
   / title 已抽到 <CardPane>, 这里只保留特异值:
     - margin-top: 16px (与 input grid 隔一行)
     - vue-diff 内部样式覆盖 (去除默认 border-radius 让主题背景充满 card) */
.contrast-result {
  margin-top: 16px;
}

/* vue-diff renders its viewer as the inner element; remove the
   wrapper's default top border-radius so the theme background flows
   edge-to-edge inside the card. */
.contrast-result :deep(.vue-diff-wrapper) {
  border-radius: 0;
}

@media (max-width: 600px) {
  // .contrast-page padding + .contrast-title font-size 已由全局 _tool-page.scss 提供
  // .contrast-card__header / .contrast-result__header 移动端 padding 10 12 已由
  //   <CardPane> 组件全局 .card-pane__header 默认提供
  .contrast-toolbar { gap: 12px; padding: 10px 12px; }
  .contrast-toolbar__select { width: 120px; }
}
</style>