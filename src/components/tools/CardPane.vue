<!--
  CardPane.vue — 工具页面内可复用的"elevated card" 容器 (Step 3 抽取).

  替换所有工具页面里的 .xxx-card + .xxx-card__header + .xxx-card__title +
  .xxx-card__actions 重复块 (出现在 13 个 .vue 文件、20+ 处)。

  命名注意:
    之所以叫 "CardPane" 而不是 "ToolCard", 是因为 src/components/cards/
    下已经有一个 ToolCard (home 网格的单个工具瓦片, 接收 :tool prop,
    渲染 router-link + 心形收藏). 两个组件定位完全不同 (home 瓦片
    vs 工具页内 section pane), API 也不同. 强制同名会让
    unplugin-vue-components 的自动导入语义模糊, 所以拆成两个名字.

  渲染结构:
    section.card-pane
      header.card-pane__header (v-if hasHeader)
        span.card-pane__title   ← slot title / {{ title }}
        div.card-pane__actions  ← slot actions (v-if)
      div.card-pane__body       ← default slot

  Props:
    - title               卡片标题文字 (可选 — 不传且没有 #title slot 则不渲染 header)
    - headerPadding       header 内边距 (desktop), 默认 '8px 16px'
    - headerMobilePadding 移动端 (≤600px) header 内边距, 默认 '10px 12px'
    - bodyPadding         body 内边距 (desktop), 默认 '20px'
    - bodyMobilePadding   移动端 (≤600px) body 内边距, 默认 = bodyPadding
    - radius              border-radius, 默认 '4px' (现有 11 个 caller);
                           早期用 <el-card> 的 hash/pwd/timestamp/text-stats
                           传 '8px' 以保留原视觉

  典型用法 (见 caller 模板):
    1) 有 header + body (无 padding) — base64 / sql / xml / contrast / encryptionDetail / json
       `<CardPane :title="t('xxx.section.source')"> ... </CardPane>`
    2) 无 header, 只用 body padding 充当 elevated 容器 — crontab / qrcode / timer
       `<CardPane class="c-card" body-padding="20px 24px"> ... </CardPane>`
    3) body padding 移动端有变体 — timer
       `<CardPane body-padding="32px 24px" body-mobile-padding="20px 16px"> ... </CardPane>`
    4) header mobile padding outlier — json
       `<CardPane header-mobile-padding="6px 12px" :title="..."> ... </CardPane>`
-->
<template>
  <section :class="['card-pane', $attrs.class]" :style="rootStyle">
    <header
      v-if="hasHeader"
      class="card-pane__header"
      :style="headerStyle"
    >
      <span class="card-pane__title">
        <slot name="title">{{ title }}</slot>
      </span>
      <div v-if="$slots.actions" class="card-pane__actions">
        <slot name="actions" />
      </div>
    </header>
    <div
      class="card-pane__body"
      :style="bodyStyle"
    >
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

const props = withDefaults(defineProps<{
  /** 卡片标题文字 (可选 — 不传且没有 #title slot 则不渲染 header) */
  title?: string
  /** header 内边距 (desktop)。默认 '8px 16px' */
  headerPadding?: string
  /** header 内边距 (mobile ≤600px)。默认 '10px 12px' (json.vue 是 '6px 12px') */
  headerMobilePadding?: string
  /** body 内边距 (desktop)。默认 '20px' (最常见的输入表单卡片 padding)。
   *  crontab/qrcode 传 '20px 24px'，timer 传 '32px 24px'，
   *  sql/xml/base64/contrast/json 等用 ToolTextarea 的卡片传 '0'。 */
  bodyPadding?: string
  /** body 内边距 (mobile ≤600px)。默认 = bodyPadding (无变化)。
   *  timer.vue 传 '20px 16px' 覆盖 '32px 24px'。 */
  bodyMobilePadding?: string
  /** border-radius。默认 '8px' (it-tools.tech 风格)。
   *  早期 <el-card border-radius: 8px> 风格的 hash/pwd/timestamp/text-stats
   *  现在不用传了, 跟其他工具页一致用默认 8px。 */
  radius?: string
}>(), {
  title: '',
  headerPadding: '8px 16px',
  headerMobilePadding: '10px 12px',
  bodyPadding: '20px',
  bodyMobilePadding: undefined,
  radius: '8px',
})

const slots = useSlots()

// Header 是否渲染: 显式传了 title prop, 或 caller 提供了 #title /
// #actions slot 中的任意一个。
const hasHeader = computed(() =>
  Boolean(props.title) || Boolean(slots.title) || Boolean(slots.actions),
)

// Header padding 用 CSS 变量在 scoped @media 内响应 — caller 改
// headerMobilePadding prop 即可改移动端 padding, 不需要 caller 写
// @media + :deep() 块。
const headerStyle = computed(() => ({
  '--cp-header-padding': props.headerPadding,
  '--cp-header-padding-mobile': props.headerMobilePadding,
}))

const bodyStyle = computed(() => ({
  '--cp-body-padding': props.bodyPadding,
  '--cp-body-padding-mobile': props.bodyMobilePadding ?? props.bodyPadding,
}))

const rootStyle = computed(() => ({
  '--cp-radius': props.radius,
}))
</script>

<style lang="scss" scoped>
/* Card 容器 — flex column 让 body 可以 flex:1 撑满剩余空间。
   background/border/radius/overflow 与原所有 .xxx-card 100% 一致。
   border-radius 通过 --cp-radius 控制 (默认 4px, caller 可传 8px)。 */
.card-pane {
  display: flex;
  flex-direction: column;
  background-color: var(--it-bg-elevated);
  border: 1px solid var(--it-border);
  border-radius: var(--cp-radius, 4px);
  overflow: hidden;
}

/* Header — display flex + 两端对齐 + 12px gap + border-bottom,
   padding 通过 CSS 变量响应 caller 传的 prop。 */
.card-pane__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: var(--cp-header-padding, 8px 16px);
  border-bottom: 1px solid var(--it-border);
  background-color: var(--it-bg-elevated);
}

@media (max-width: 600px) {
  .card-pane__header {
    /* 移动端 padding — caller 通过 headerMobilePadding prop 控制
       (json.vue 传 '6px 12px' 覆盖默认 '10px 12px')。 */
    padding: var(--cp-header-padding-mobile, 10px 12px);
  }
}

.card-pane__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--it-text-primary);
}

.card-pane__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Body — flex column + min-height 0 让 caller 的 el-input 等
   flex 元素能正确 fill-the-card (跟原 .xxx-card 的用法一致)。
   无 header 时仍然渲染 body, 充当 elevated 容器 (crontab/qrcode/timer)。 */
.card-pane__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  /* padding 通过 CSS 变量控制 (desktop) — 移动端在 @media 里覆盖 */
  padding: var(--cp-body-padding, 0);
}

@media (max-width: 600px) {
  .card-pane__body {
    /* 移动端 padding — caller 通过 bodyMobilePadding prop 控制
       (timer.vue 传 '20px 16px' 覆盖 '32px 24px')。 */
    padding: var(--cp-body-padding-mobile, var(--cp-body-padding, 0));
  }
}
</style>
