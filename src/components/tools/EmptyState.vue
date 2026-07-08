<!--
  EmptyState.vue — 工具页"无内容"占位组件 (Step 5 抽取).

  替换 password-strength 的 .empty (page-level 居中占位) +
  qrcode 的 .q-empty (CardPane 内部居中占位) 两块共享 CSS:

    color: var(--it-text-tertiary);
    font-size: 14px;
    text-align: center;

  区别只在 padding 跟容器: pwd 是 page-level 居中, 需要 32px padding
  + 24px margin-top 跟上方 CardPane 隔一行; qrcode 是 CardPane body
  内的居中占位, 父容器已经居中, 不需要 padding / margin-top。

  Props:
    - padding   上下 padding, 默认 '32px' (page-level)。传 '0'
                即 "无 padding 内嵌模式" (CardPane 内部用)。
    - marginTop 顶部 margin, 默认 '0' (caller 用 gap 隔开即可)。
                pwd 传 '24px' 保留原 .empty 的视觉。
    - tag       渲染标签, 默认 'div'。

  注意: 不要在 HTML 注释里嵌 `&lt;EmptyState&gt;` 示例代码, Vue
  模板编译器会把注释里的标签当未闭合元素, 触发 "Element is
  missing end tag"。用法示例参考 caller: password-strength.vue
  传 margin-top="24px" (page-level), qrcode.vue 传 padding="0"
  (CardPane 内部)。
-->
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
  /** 上下 padding。默认 '32px' (page-level); CardPane 内部用传 '0'。 */
  padding?: string
  /** 顶部 margin。默认 '0'。 */
  marginTop?: string
  /** 渲染标签。默认 'div'。 */
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
