<!--
  ToolTextarea.vue — 工具页内"fill-the-card" monospace textarea (Step 4 抽取).

  替换所有工具页面里 .xxx-textarea + :deep(.el-textarea) + :deep(textarea) 的
  23 行重复 CSS 块 (出现在 5 个 .vue 文件、9 处): base64 (×2) / contrast (×2) /
  json (×1) / sql (×2) / xml (×2)。

  命名注意:
    跟 <CardPane> 一样, 放在 src/components/tools/ (tool page 组件,
    区别于 home 网格 cards/). 跟 <CardPane> 配合使用 — 由 <CardPane> 的
    flex body 提供"fill the card"容器, 本组件继续在容器内 grow:

    <CardPane :title="t('xxx.section.source')">
      <ToolTextarea v-model="form.data" :rows="10" />
    </CardPane>

  Props (只暴露 caller 关心的字段; 其余 hardcode 进组件, 因为所有 9
  处使用都对它们 100% 一致):

    - modelValue   双向绑定值 (caller 用 v-model)
    - rows         textarea 行数, 默认 14 (json/sql/xml 用 14; base64/contrast
                   用 :rows="10" 显式覆盖)
    - placeholder  placeholder 文字
    - disabled     是否禁用, 默认 false (result 端传 disabled)

  硬编码进去的样式 (跟原 .xxx-textarea + :deep 块 100% 一致):
    - type="textarea" / resize="none" / spellcheck="false"
    - 容器 display: flex; flex: 1; min-height: 0  (fill-the-card)
    - 字体: 'Fira Code', 'Cascadia Code', Consolas, Menlo, monospace
    - 字号 / 行高 / 色: 13px / 1.55 / var(--it-text-primary)
    - border: none / border-radius: 0 / background: transparent
    - padding: 14px 16px
    - box-shadow: none (on focus + on .el-textarea__inner)

  注意: encryptionDetail.vue 的 .enc-field__textarea 是另一种模式 (行内
  表单, 不填满卡片, 保留 Element Plus 默认 border + bg), 不在本次抽取
  范围 — 仍用 <el-input class="enc-field__textarea">。
-->
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
  /** v-model 绑定值 */
  modelValue: string
  /** textarea 行数, 默认 14 */
  rows?: number
  /** placeholder 文字 */
  placeholder?: string
  /** 是否禁用 (result 端一般传 true) */
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
/* Make the el-input wrapper fill the surrounding flex card body.
   display: flex + flex: 1 + min-height: 0 lets the textarea grow
   to eat leftover vertical space inside <CardPane> body. 跟原
   .xxx-textarea + :deep(.el-textarea) 块 100% 一致。 */
.tool-textarea,
.tool-textarea :deep(.el-textarea) {
  display: flex;
  flex: 1;
  min-height: 0;
}

/* The actual <textarea> element inside el-input — monospace, 13/1.55,
   no border, transparent bg, 14/16 padding. 跟原 .xxx-textarea
   :deep(textarea) 块 100% 一致。 */
.tool-textarea :deep(textarea) {
  flex: 1;
  min-height: 0;
  border: none !important;
  border-radius: 0;
  padding: 14px 16px;
  font-family: 'Fira Code', 'Cascadia Code', Consolas, Menlo, monospace;
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
