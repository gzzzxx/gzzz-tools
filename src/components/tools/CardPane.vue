<!-- 工具页面可复用的卡片容器组件 -->

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

export type CardPaneVariant = 'default' | 'result'

const props = withDefaults(defineProps<{
  title?: string
  variant?: CardPaneVariant
  headerPadding?: string
  headerMobilePadding?: string
  bodyPadding?: string
  radius?: string
}>(), {
  title: '',
  variant: 'default',
  headerPadding: '8px 16px',
  headerMobilePadding: '10px 12px',
  bodyPadding: '20px',
  radius: '4px',
})

const slots = useSlots()

const hasHeader = computed(() =>
  Boolean(props.title) || Boolean(slots.title) || Boolean(slots.actions),
)

const headerStyle = computed(() => ({
  '--cp-header-padding': props.headerPadding,
  '--cp-header-padding-mobile': props.headerMobilePadding,
}))

const bodyStyle = computed(() => ({
  '--cp-body-padding': props.bodyPadding,
  '--cp-body-padding-mobile': props.bodyPadding,
}))

const rootStyle = computed(() => ({
  '--cp-radius': props.radius,
  '--cp-bg': props.variant === 'result'
    ? 'var(--it-card-result-bg)'
    : 'var(--it-bg-elevated)',
}))
</script>

<style lang="scss" scoped>
.card-pane {
  display: flex;
  flex-direction: column;
  background-color: var(--cp-bg, var(--it-bg-elevated));
  border: 1px solid var(--it-border);
  border-radius: var(--cp-radius);
  overflow: hidden;
}

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

.card-pane__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: var(--cp-body-padding, 0);
}

@media (max-width: 600px) {
  .card-pane__body {
    padding: var(--cp-body-padding-mobile, var(--cp-body-padding, 0));
  }
}
</style>
