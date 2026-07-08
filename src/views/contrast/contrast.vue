<!-- 代码/文本对比工具，支持多种语言和对比模式 -->

<template>
  <ToolPage
    class="contrast-page"
    preset="wide-editor"
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

    <div class="tool-grid">
      <CardPane class="contrast-card" :title="t('contrastPage.section.prev')" body-padding="0">
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

      <CardPane class="contrast-card" :title="t('contrastPage.section.current')" body-padding="0">
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

    <CardPane class="contrast-result" :title="t('contrastPage.section.result')" body-padding="0">
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

<script setup lang="ts">
import { computed, nextTick, reactive, watch } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { useIsDark } from '~/composables/useIsDark'

const { t } = useI18n({ useScope: 'global' })
const isDark = useIsDark()

const theme = computed(() => (isDark.value ? 'dark' : 'light'))

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

// 手动同步主题和模式类名，确保切换后正确重绘
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
/* 设置工具栏 */
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

.contrast-result {
  margin-top: var(--tool-section-gap, 20px);
}

.contrast-result :deep(.vue-diff-wrapper) {
  border-radius: 0;
}

@media (max-width: 600px) {
  .contrast-toolbar { gap: 12px; padding: 10px 12px; }
  .contrast-toolbar__select { width: 120px; }
}
</style>
