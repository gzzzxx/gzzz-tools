<!--
  format.vue — JSON pretty-printer / live display.

  Layout: same card-based two-column pattern as xml.vue / sql.vue,
  with one tweak — no center arrow badge, no top toolbar, no card
  header actions. Both editors fill the full horizontal width as
  1fr 1fr (the arrow would steal ~40px from each side, and the
  user wants maximum editor area).

  Hybrid editor pair — left is a plain el-input textarea
  (matches the SQL formatter's input style for muscle memory
  + smaller bundle, since vanilla-jsoneditor is 1MB+), right
  is a full vanilla-jsoneditor in readonly mode with the menu,
  navigation, and status bars visible. Both bind the same `text`
  ref via v-model, so editing the left instantly reflects on the
  right — no Format button needed.

  vanilla-jsoneditor ships its own dark theme via the
  .jse-theme-dark root class; the light theme is the default (no
  extra class needed). We toggle the dark class via useIsDark so
  the editor follows the app's theme toggle.
-->
<template>
  <ToolPage
    class="json-page"
    preset="wide-editor"
    :title="t('tools.format.name')"
    :subtitle="t('tools.format.desc')"
  >

    <div class="tool-grid tool-grid--fullscreen">
      <CardPane class="json-card">
        <ToolTextarea
          v-model="text"
          :placeholder="t('formatPage.input.placeholder')"
        />
      </CardPane>

      <CardPane class="json-card">
        <div class="json-card__body">
          <JsonEditorVue
            id="json-editor-result"
            :class="editorClass"
            mode="text"
            v-model="text"
            :mainMenuBar="true"
            :navigationBar="true"
            :statusBar="true"
            :readOnly="true"
            :askToFormat="false"
          />
        </div>
      </CardPane>
    </div>
  </ToolPage>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import JsonEditorVue from 'json-editor-vue'
import 'vanilla-jsoneditor/themes/jse-theme-dark.css'
import { useI18n } from 'vue-i18n'
import { useIsDark } from '~/composables/useIsDark'

const text = ref('')
const { t } = useI18n({ useScope: 'global' })
const isDark = useIsDark()

const editorClass = computed(() =>
  isDark.value ? 'my-json-editor jse-theme-dark' : 'my-json-editor',
)
</script>

<style lang="scss" scoped>
/* Outer wrapper — same shape as xml.vue / sql.vue: wide (1600px)
   for a horizontal two-pane tool, viewport-fixed so the page
   never triggers a page-level scrollbar (height = 100vh -
   header (56) - page margins (16+16), with overflow:hidden to
   clip inner overflow).
   尺寸由 <ToolPage preset="wide-editor"> 提供; 这里只保留
   viewport-fixed 全屏双栏布局 (height / display / flex / overflow)。 */
.json-page {
  // viewport-fixed 全屏双栏 — 不能用 CSS 变量化, 直接写规则
  height: calc(100vh - 88px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* .tool-grid(.tool-grid--fullscreen) 已抽到 ~/styles/_tool-recipes.scss
   全局 utility。模板里 <div class="tool-grid tool-grid--fullscreen">
   自动套用相同样式, 父 scoped 不用再写一份。 */

/* .json-card / .json-card__header / .json-card__title 块已抽到
   ~/components/tools/CardPane.vue 组件 (全局 .card-pane /
   .card-pane__header / .card-pane__title)。模板里 <CardPane class="json-card"
   :title="..." header-mobile-padding="6px 12px"> 自动套用相同样式,
   父 scoped 不用再写一份。移动端 padding 6 12 是 json 特例 (其他
   工具都是 10 12), 通过 headerMobilePadding prop 传入。 */

/* Left card: fill the card body with the el-input textarea. Same
   pierce-through pattern as sql.vue / xml.vue — el-input wraps
   the textarea in .el-textarea with inline height; we force
   flex:1 + min-height:0 down the chain so it actually grows.
   min-height:0 on the inner textarea so flex shrinking works
   (browsers default to min-height:auto, which prevents
   shrinking below content size). 23 行重复块已抽到
   ~/components/tools/ToolTextarea.vue 组件, 父 scoped 不需要再写一份。 */

/* Right card: force the json-editor-vue wrapper to fill the
   card body. vanilla-jsoneditor renders into a div with class
   .jse-main; the outer wrapper needs an explicit height or
   the editor renders at 0px tall. */
.json-card__body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.json-card__body :deep(.my-json-editor) {
  height: 100%;
}

/* Dark-theme color tweak — preserved from the original
   home-page.scss. Sets the vanilla-jsoneditor theme background
   to #222 in dark mode (default is slightly lighter). */
:deep(.jse-theme-dark) {
  --jse-theme-color: #222;
}

@media (max-width: 600px) {
  // .json-page padding + .json-title font-size 已由全局 _tool-page.scss 提供
  // .json-card__header 移动端 padding 6 12 已由 <CardPane header-mobile-padding="6px 12px"> prop 传入
}
</style>
