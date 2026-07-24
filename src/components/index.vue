<!--
  首页：英雄区 + 收藏 + 工具网格。

  - Hero —— 通过 v-model:category 与本页共享当前选中的分类
  - Favorites —— 自管拖拽 + 空 CTA
  - 工具区 —— 按选中分类过滤展示
-->

<template>
  <div class="it-page-content home-page">
    <Hero
      v-model:category="selectedCategory"
      :tools="localizedTools"
    />

    <Favorites />

    <!-- 工具区 -->
    <div class="home-page__section-title-row">
      <h3 class="home-page__section-title">
        {{ currentSectionTitle }}
        <span class="home-page__section-count">{{ filteredTools.length }}</span>
      </h3>
    </div>

    <div v-if="filteredTools.length > 0" class="home-page__grid home-page__grid--tools">
      <div
        v-for="(tool, index) in filteredTools"
        :key="tool.path"
        class="home-page__cell"
        :style="{ '--i': index }"
      >
        <ToolCard :tool="tool" />
      </div>
    </div>
    <div v-else class="home-page__empty">
      {{ t('home.tab.empty') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useT } from '~/composables/useT'
import Hero from './Hero.vue'
import Favorites from './Favorites.vue'
import ToolCard from './cards/ToolCard.vue'
import { useLocalizedTools, type Tool } from '~/composables/useTools'
import { CATEGORIES, type TabKey } from '~/tools/registry'

const { localizedTools } = useLocalizedTools()
const { t } = useT()

// ----- Category selection (shared with Hero via v-model) -----
const selectedCategory = ref<TabKey>('all')

// Section title i18n keys — derived from the registry's CATEGORIES
// so the tools section can show "开发 · 6" instead of just "全部工具"
// without redeclaring the same 4-key map.
const CATEGORY_LABEL_KEYS: Record<TabKey, string> = {
  all: 'home.section.tools',
  ...Object.fromEntries(CATEGORIES.map((c) => [c.key, c.i18nKey])),
}

const filteredTools = computed<Tool[]>(() =>
  selectedCategory.value === 'all'
    ? localizedTools.value
    : localizedTools.value.filter((tool) => tool.category === selectedCategory.value),
)

const currentSectionTitle = computed(() => t(CATEGORY_LABEL_KEYS[selectedCategory.value]))
</script>

<style lang="scss" scoped>
.home-page {
  padding: 16px 16px 40px;
}

.home-page__section-title {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 18px 0 12px;
  padding-left: 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--it-text-secondary);
  letter-spacing: 0.02em;

  // Vertical accent bar — gives the title a typographic anchor so it
  // doesn't read as a stranded label.
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 14px;
    border-radius: 2px;
    background: linear-gradient(180deg, var(--brand-primary), var(--brand-primary-light));
  }
}
.home-page__section-title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}
.home-page__section-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 18px;
  padding: 0 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--it-text-tertiary);
  background-color: var(--brand-tint);
  border-radius: 999px;
  letter-spacing: 0;
}

.home-page__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  width: 100%;
  box-sizing: border-box;
  column-gap: 12px;
  row-gap: 12px;
}
.home-page__grid--tools {
  @media (min-width: 640px)  { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (min-width: 768px)  { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  @media (min-width: 1280px) { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

.home-page__cell {
  min-width: 0;
  display: flex;
  align-self: stretch;
}

.home-page__empty {
  padding: 40px 16px;
  text-align: center;
  font-size: 13px;
  color: var(--it-text-tertiary);
  background-color: var(--it-bg-elevated);
  border: 1px dashed var(--it-border);
  border-radius: 10px;
}
</style>
