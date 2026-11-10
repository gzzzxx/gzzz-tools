<!-- 工具页面的标准外壳组件 -->

<template>
  <section class="tool-page" :style="presetStyle">
    <h2 class="tool-page__title">{{ title }}</h2>
    <div v-if="subtitle" class="tool-page__subtitle">{{ subtitle }}</div>
    <slot />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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

const presetStyle = computed(() => presetVars[props.preset])
</script>
