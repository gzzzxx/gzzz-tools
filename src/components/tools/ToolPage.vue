<!--
  ToolPage.vue — 工具页面的标准外壳 (Step 2 抽取).

  渲染结构:
    <section class="tool-page" :class="$attrs.class">
      <h2 class="tool-page__title">{{ title }}</h2>
      <div v-if="subtitle" class="tool-page__subtitle">{{ subtitle }}</div>
      <slot />
    </section>

  Props:
    - title       居中大标题 (必填, 必须传)
    - subtitle    居中副标题 (可选, 不传则不渲染副标题元素)
    - preset      页面尺寸族, 把各工具页重复的 4 个 CSS 变量集中管理

  Attribute Forwarding:
    父组件传 `class="sql-page"` 会被手动挂到根元素:
    <section class="tool-page sql-page">。父 scoped 的
    `.sql-page[data-v-xxx]` 选择器仍会命中, 所以父页面可以继续写
    height / display / overflow 等特异布局。

  关于 subtitle margin-bottom:
    preset 会设置 `--tool-page-subtitle-mb`, 内部
    .tool-page__subtitle 的 margin-bottom 通过 var() 读取。这样新增
    工具只需选择尺寸族, 不必在每个页面重复 4 个 CSS 变量。

  Subtitle 条件渲染:
    不传 subtitle 时整个 div 节点不渲染 — 与原"硬编码空字符串"的
    行为对比: 原代码 `<div class="tool-page__subtitle">{{ '' }}</div>`
    会渲染一个空的 div 占一行高度, 新的实现不会。不传 subtitle 的
    工具页面目前 0 个 (所有 15 个工具页面都有副标题), 所以不影响。
    未来如果新增无副标题的工具, 行为变更符合预期 (没副标题不该占行)。
-->
<template>
  <section
    v-bind="forwardedAttrs"
    :class="['tool-page', $attrs.class]"
    :style="[presetStyle, $attrs.style]"
  >
    <h2 class="tool-page__title">{{ title }}</h2>
    <div v-if="subtitle" class="tool-page__subtitle">{{ subtitle }}</div>
    <slot />
  </section>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

export type ToolPagePreset =
  | 'wide-editor'
  | 'wide-form'
  | 'large-form'
  | 'medium-form'

const presetVars: Record<ToolPagePreset, Record<string, string>> = {
  'wide-editor': {
    '--tool-page-max-width': '1600px',
  },
  'wide-form': {
    '--tool-page-max-width': '1400px',
  },
  'large-form': {
    '--tool-page-max-width': '1200px',
  },
  'medium-form': {
    '--tool-page-max-width': '800px',
  },
}

const props = withDefaults(defineProps<{
  /** 居中大标题文字 (必填)。原所有工具页面都传值。 */
  title: string
  /** 居中副标题文字 (可选)。不传则不渲染副标题元素。 */
  subtitle?: string
  /** 页面尺寸族。默认 wide-editor 与 _tool-page.scss fallback 保持一致。 */
  preset?: ToolPagePreset
}>(), {
  preset: 'wide-editor',
})

const attrs = useAttrs()
const forwardedAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})

const presetStyle = computed(() => presetVars[props.preset])

// 手动转发 attrs, 避免 class/style 被 Vue 自动合并后和 preset style
// 重复。父 scoped 的 .sql-page 仍会命中根元素, 可继续写页面特异规则。
defineOptions({ inheritAttrs: false })
</script>
