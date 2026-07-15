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
          :placeholder="t('formatPage.input.placeholder')"
        />
      </CardPane>

      <CardPane class="json-card" body-padding="0">
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

<script setup lang="ts">
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
</style>
