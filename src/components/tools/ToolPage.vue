<!-- 工具页面的标准外壳组件 -->

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
  | 'large-form'
  | 'medium-form'

const presetVars: Record<ToolPagePreset, Record<string, string>> = {
  'wide-editor': {
    '--tool-page-max-width': '1600px',
  },
  'large-form': {
    '--tool-page-max-width': '1200px',
  },
  'medium-form': {
    '--tool-page-max-width': '800px',
  },
}

const props = withDefaults(defineProps<{
  title: string
  subtitle?: string
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

defineOptions({ inheritAttrs: false })
</script>
