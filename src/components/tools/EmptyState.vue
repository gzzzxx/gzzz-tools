<!-- 工具页无内容占位组件 -->

<template>
  <component
    :is="tag"
    :class="['tool-empty', $attrs.class]"
    :style="rootStyle"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

const props = withDefaults(defineProps<{
  padding?: string
  marginTop?: string
  tag?: string
}>(), {
  padding: '32px',
  marginTop: '0',
  tag: 'div',
})

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()

const rootStyle = computed(() => ({
  '--te-padding': props.padding,
  '--te-margin-top': props.marginTop,
  // 透传 caller 的 style (不要重复合并 class, 上面 :class 已经处理)
  ...(attrs.style as Record<string, string> | undefined),
}))
</script>

<style lang="scss" scoped>
.tool-empty {
  text-align: center;
  font-size: 14px;
  line-height: 1.6;
  color: var(--it-text-tertiary);
  padding: var(--te-padding, 32px) 16px;
  margin-top: var(--te-margin-top, 0);
}
</style>
