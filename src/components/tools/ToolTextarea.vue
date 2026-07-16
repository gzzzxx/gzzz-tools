<!-- 工具页内可填充卡片的等宽字体文本域组件 -->

<template>
  <el-input
    :model-value="modelValue"
    type="textarea"
    :rows="rows"
    resize="none"
    spellcheck="false"
    :placeholder="placeholder"
    :disabled="disabled"
    class="tool-textarea"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string
  rows?: number
  placeholder?: string
  disabled?: boolean
}>(), {
  rows: 14,
  placeholder: '',
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<style lang="scss" scoped>
.tool-textarea,
.tool-textarea :deep(.el-textarea) {
  display: flex;
  flex: 1;
  min-height: 0;
}

.tool-textarea :deep(textarea) {
  flex: 1;
  min-height: 0;
  border: none !important;
  border-radius: 0 0 8px 8px;
  padding: 14px 16px;
  font-family: var(--font-mono-code);
  font-size: 13px;
  line-height: 1.55;
  resize: none;
  background: transparent;
  color: var(--it-text-primary);
}

.tool-textarea :deep(textarea):focus {
  box-shadow: none;
}

.tool-textarea :deep(.el-textarea__inner) {
  box-shadow: none !important;
}
</style>
