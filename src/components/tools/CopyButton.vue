<!-- CopyButton — 统一复制按钮 -->
<template>
  <el-button
    v-if="text"
    :size="size"
    :type="type"
    :icon="DocumentCopy"
    :link="variant === 'text'"
    :circle="variant === 'icon'"
    :disabled="disabled"
    :class="['tool-copy-btn', `tool-copy-btn--${variant}`]"
    @click="onCopy"
  >
    <template v-if="variant === 'text'">
      <slot>{{ t('common.copy') }}</slot>
    </template>
  </el-button>
</template>

<script setup lang="ts">
import { DocumentCopy } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { useClipboard } from '~/composables/useClipboard'

const props = withDefaults(defineProps<{
  /** 要复制的文本, 空字符串时不渲染按钮 (替代 caller 写 :disabled / v-if) */
  text: string
  /** 'text' = 文字+icon 链接按钮; 'icon' = 纯 icon 圆形按钮 */
  variant?: 'text' | 'icon'
  size?: 'small' | 'default' | 'large'
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'
  disabled?: boolean
}>(), {
  variant: 'text',
  size: 'small',
  type: 'default',
  disabled: false,
})

const { t } = useI18n({ useScope: 'global' })
const { copy } = useClipboard()

function onCopy() {
  copy(props.text)
}
</script>

<style lang="scss" scoped>
.tool-copy-btn--icon:not(:disabled):hover {
  background-color: var(--brand-primary-soft);
  color: var(--brand-primary);
}
</style>
