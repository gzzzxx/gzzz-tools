<!-- JSON 格式化/查看工具，左侧输入右侧实时预览 -->

<template>
  <ToolPage
    class="json-page tool-page--fullscreen"
    preset="wide-editor"
    :title="t('tools.format.name')"
    :subtitle="t('tools.format.desc')"
  >

    <div class="tool-grid tool-grid--fullscreen">
      <CardPane class="json-card" body-padding="0">
        <ToolTextarea
          v-model="text"
          :placeholder="t('jsonPage.input.placeholder')"
        />
      </CardPane>

      <CardPane class="json-card" body-padding="0">
        <div class="json-card__body">
          <JsonEditorVue
            id="json-editor-result"
            ref="editorRef"
            :class="editorClass"
            :mode="Mode.text"
            :mainMenuBar="true"
            :navigationBar="true"
            :statusBar="true"
            :askToFormat="false"
          />
        </div>
      </CardPane>
    </div>
  </ToolPage>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import JsonEditorVue from 'json-editor-vue'
import { Mode } from 'vanilla-jsoneditor'
import 'vanilla-jsoneditor/themes/jse-theme-dark.css'
import { useT } from '~/composables/useT'
import { useIsDark } from '~/composables/useIsDark'

/** 左侧文本，唯一数据源 */
const text = ref('')
const editorRef = ref<InstanceType<typeof JsonEditorVue>>()

const { t } = useT()
const isDark = useIsDark()

const editorClass = computed(() =>
  isDark.value ? 'my-json-editor jse-theme-dark' : 'my-json-editor',
)

/** json-editor-vue 暴露出来的 vanilla-jsoneditor 实例 */
interface EditorInstance {
  update(content: { text: string }): Promise<void>
}

function getEditor(): EditorInstance | undefined {
  const exposed = editorRef.value as unknown as
    | { jsonEditor?: EditorInstance }
    | undefined
  return exposed?.jsonEditor
}

// 左侧输入 → 右侧预览。
//
// 这里刻意不把编辑器的值绑回左侧：编辑器的 v-model 在 tree/table 模式下
// 回传的是**解析后的对象**，共用一个 ref 会让左侧直接显示 [object Object]。
// 左侧只做输入源，右侧是它的实时预览。
watch(text, (value) => {
  void getEditor()?.update({ text: value })
})
</script>

<style lang="scss" scoped>

.json-card__body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.json-card__body :deep(.my-json-editor) {
  height: 100%;
}

:deep(.jse-theme-dark) {
  --jse-theme-color: #222;
}
// 修改json-editor的样式
.tool-textarea :deep(textarea) {
  border-radius: 4px;
}
:deep(.jse-contents) {
  border-left: 0px !important;
  border-right: 0px !important;
}
:deep(.jse-status-bar) {
  border-left: 0px !important;
  border-right: 0px !important;
  border-top: 0px !important;
  border-bottom: 0px !important;
}
:deep(.jse-tree-mode.svelte-vrx1dr .jse-contents:where(.svelte-vrx1dr):last-child) {
  border-bottom: 0px !important;
}
</style>
