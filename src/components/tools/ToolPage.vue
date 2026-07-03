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

  Attribute Fallthrough:
    父组件传 `class="sql-page"`, Vue 自动 fallthrough 到根元素
    <section class="tool-page sql-page">。父 scoped 的
    `.sql-page[data-v-xxx]` 选择器会命中 (Vue 3 子组件根元素继承
    父 scope attribute), 所以父可以在 scoped .xxx-page 块里覆盖
    --tool-page-max-width 等 CSS 变量 + 写其他特异样式 (height /
    display / overflow 等)。

  关于 subtitle margin-bottom:
    caller 不能在 scoped 里写 `.sql-subtitle { margin-bottom: 24px }`
    命中 <ToolPage> 内部的 div (scoped 不会穿透到子组件内部元素)。
    所以通过 CSS 变量桥接 — caller 设 `--tool-page-subtitle-mb: 24px`,
    内部 .tool-page__subtitle 的 margin-bottom 通过 var() 继承下来。
    详见 _tool-page.scss 注释。

  Subtitle 条件渲染:
    不传 subtitle 时整个 div 节点不渲染 — 与原"硬编码空字符串"的
    行为对比: 原代码 `<div class="tool-page__subtitle">{{ '' }}</div>`
    会渲染一个空的 div 占一行高度, 新的实现不会。不传 subtitle 的
    工具页面目前 0 个 (所有 15 个工具页面都有副标题), 所以不影响。
    未来如果新增无副标题的工具, 行为变更符合预期 (没副标题不该占行)。
-->
<template>
  <section :class="['tool-page', $attrs.class]">
    <h2 class="tool-page__title">{{ title }}</h2>
    <div v-if="subtitle" class="tool-page__subtitle">{{ subtitle }}</div>
    <slot />
  </section>
</template>

<script setup lang="ts">
defineProps<{
  /** 居中大标题文字 (必填)。原所有工具页面都传值。 */
  title: string
  /** 居中副标题文字 (可选)。不传则不渲染副标题元素。 */
  subtitle?: string
}>()

// class fallthrough: 不禁用 inheritAttrs, 让 Vue 自动把
// 父传的 class="sql-page" 等挂到根 <section> 上。
// 父 scoped 的 .sql-page 选择器能命中根元素 (Vue 3 子组件根
// 元素继承父 scope attribute), 所以父可以设 CSS 变量 + 写
// height / display / overflow 等其他特异值。
defineOptions({ inheritAttrs: true })
</script>
