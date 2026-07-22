<!-- 代码/文本对比工具，支持多种语言和对比模式 -->

<template>
  <ToolPage
    class="contrast-page"
    preset="wide-editor"
    :title="t('tools.contrast.name')"
    :subtitle="t('tools.contrast.desc')"
  >

    <div class="tool-toolbar">
      <div class="tool-toolbar__group">
        <label class="tool-bar-label">
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

      <div class="tool-toolbar__group">
        <label class="tool-bar-label">
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
        <div class="tool-toolbar__group">
          <el-switch v-model="form.folding" />
          <span class="tool-bar-hint">
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
import { computed, reactive } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import { useT } from '~/composables/useT'
import { useIsDark } from '~/composables/useIsDark'

const { t } = useT()
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
</script>

<style lang="scss" scoped>
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
  .contrast-toolbar__select { width: 120px; }
}
</style>
