<!-- 首页组件，展示收藏工具和全部工具列表 -->

<template>
  <div class="it-page-content home-page">
    <div class="home-page__grid home-page__grid--with-banner">
      <div class="home-page__cell home-page__cell--banner">
        <FollowBanner />
      </div>
    </div>

    <template v-if="favoriteTools.length > 0">
      <div class="home-page__section-title-row">
        <h3 class="home-page__section-title home-page__section-title--favorites">
          {{ t('home.section.favorites') }}
        </h3>
        <span class="home-page__drag-hint" aria-hidden="true">
          {{ dragHint }}
        </span>
      </div>

      <draggable
        v-model="localFavorites"
        :animation="180"
        item-key="path"
        handle=".it-tool-card"
        ghost-class="home-page__cell--ghost"
        drag-class="home-page__cell--drag"
        :force-fallback="true"
        :fallback-tolerance="3"
        class="home-page__grid home-page__grid--tools home-page__grid--draggable"
        @start="isDragging = true"
        @end="onDragEnd"
      >
        <template #item="{ element }">
          <div class="home-page__cell home-page__cell--draggable">
            <ToolCard :tool="element" />
          </div>
        </template>
      </draggable>
    </template>

    <div class="home-page__section-title-row">
      <h3 class="home-page__section-title">{{ t('home.section.tools') }}</h3>
    </div>

    <div class="home-page__grid home-page__grid--tools">
      <div v-for="tool in localizedTools" :key="tool.path" class="home-page__cell">
        <ToolCard :tool="tool" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useT } from '~/composables/useT'
import draggable from 'vuedraggable'
import FollowBanner from './cards/FollowBanner.vue'
import ToolCard from './cards/ToolCard.vue'
import { useLocalizedTools, type Tool } from '~/composables/useTools'
import { useFavorites } from '~/composables/useFavorites'

const { localizedTools } = useLocalizedTools()
const { favoriteTools, setFavoriteOrder } = useFavorites()
const { t } = useT()

const localFavorites = ref<Tool[]>(favoriteTools.value)
watch(favoriteTools, (next) => {
  localFavorites.value = [...next]
})

const isDragging = ref(false)
const dragHint = computed(() =>
  isDragging.value ? t('home.drag.hintActive') : t('home.drag.hintIdle'),
)

function onDragEnd() {
  isDragging.value = false
  setFavoriteOrder(localFavorites.value.map((tool) => tool.path))
}
</script>

<style lang="scss" scoped>
.home-page {
  padding: 12px 16px 32px;

  &__grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    width: 100%;
    box-sizing: border-box;
    column-gap: 12px;
    row-gap: 12px;
  }
  &__grid--with-banner,
  &__grid--tools,
  &__grid--draggable {
    @media (min-width: 640px)  { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    @media (min-width: 768px)  { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    @media (min-width: 1280px) { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  }

  &__cell {
    min-width: 0;
    display: flex;
    align-self: stretch;
  }
  &__cell--banner {
    @media (min-width: 1280px) { grid-column: 1; }
    align-self: start;
  }

  &__cell--draggable {
    position: relative;
    cursor: grab;
    border: 2px solid transparent;
    border-radius: 10px;
    width: 100%;
    box-sizing: border-box;
    transition: border-color 0.15s ease, background-color 0.15s ease, opacity 0.15s ease;

    &:active { cursor: grabbing; }

    &.home-page__cell--ghost {
      border-color: var(--ghost-border);
      border-style: dashed;
      background-color: var(--ghost-bg);
      opacity: 0.55;
    }

    &.home-page__cell--drag {
      border-color: var(--brand-primary);
      background-color: var(--el-color-primary-light-9, #ecfeff);
      box-shadow: 0 10px 24px var(--drag-shadow);
      cursor: grabbing;
      transform: rotate(-1.5deg);
    }
  }

  &__section-title {
    margin: 12px 0 12px;
    font-size: 14px;
    font-weight: 600;
    color: var(--it-text-secondary);
    letter-spacing: 0.02em;
  }
  &__section-title-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
  }
  &__drag-hint {
    font-size: 12px;
    color: var(--it-text-tertiary, #94a3b8);
    opacity: 0.7;
    transition: opacity 0.2s ease;
  }
}
</style>