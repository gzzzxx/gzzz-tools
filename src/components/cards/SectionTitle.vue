<!-- 工具分类标题组件 -->

<template>
  <div class="section-title-row">
    <h3 class="it-section-title section-title">{{ title }}</h3>
    <div v-if="$slots.default" class="section-title__extra">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<style lang="scss" scoped>
@use "~/styles/variables" as *;

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.section-title {
  flex: 1 1 auto;
}

.section-title__extra {
  flex: 0 0 auto;
  color: var(--it-text-tertiary);
  font-size: 13px;
}
</style>
