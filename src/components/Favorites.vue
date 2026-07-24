<!--
  收藏区：标题 + 拖拽网格 / 空 CTA。

  内部维护 localFavorites（vuedraggable 的 v-model 需要 writable ref），
  onDragEnd 时回写到 useFavorites composable。
-->

<template>
  <div class="favorites">
    <div class="favorites__title-row">
      <h3 class="favorites__title">
        {{ t('home.section.favorites') }}
        <span class="favorites__count">{{ favoriteTools.length }}</span>
      </h3>
      <span
        v-if="favoriteTools.length > 0"
        class="favorites__drag-hint"
        aria-hidden="true"
      >
        <svg
          class="favorites__drag-hint-icon"
          :width="14"
          :height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="9"  cy="6" r="1.2" />
          <circle cx="15" cy="6" r="1.2" />
          <circle cx="9"  cy="12" r="1.2" />
          <circle cx="15" cy="12" r="1.2" />
          <circle cx="9"  cy="18" r="1.2" />
          <circle cx="15" cy="18" r="1.2" />
        </svg>
        <span class="favorites__drag-hint-text">{{ dragHint }}</span>
      </span>
    </div>

    <draggable
      v-if="favoriteTools.length > 0"
      v-model="localFavorites"
      :animation="180"
      item-key="path"
      handle=".it-tool-card"
      ghost-class="favorites__cell--ghost"
      drag-class="favorites__cell--drag"
      :force-fallback="true"
      :fallback-tolerance="3"
      class="favorites__grid"
      @start="isDragging = true"
      @end="onDragEnd"
    >
      <template #item="{ element, index }">
        <div class="favorites__cell" :style="{ '--i': index }">
          <ToolCard :tool="element" />
        </div>
      </template>
    </draggable>

    <div v-else class="favorites__empty">
      <svg
        class="favorites__empty-icon"
        :width="32"
        :height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M12 21s-7-4.5-9.5-9.5C.8 7.5 3.5 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 3.5 0 6.2 3.5 4.5 7.5C19 16.5 12 21 12 21z" />
      </svg>
      <div class="favorites__empty-text">
        <div class="favorites__empty-title">
          {{ t('home.favoritesEmpty.title') }}
        </div>
        <div class="favorites__empty-desc">
          {{ t('home.favoritesEmpty.desc') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useT } from '~/composables/useT'
import draggable from 'vuedraggable'
import ToolCard from './cards/ToolCard.vue'
import { useFavorites } from '~/composables/useFavorites'
import { type Tool } from '~/composables/useTools'

const { favoriteTools, setFavoriteOrder } = useFavorites()
const { t } = useT()

// vuedraggable needs a writable ref to mutate during drag. Mirror the
// composable's value and sync back on change.
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
.favorites {
  &__title-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
  }
  &__title {
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
  &__count {
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

  &__drag-hint {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--it-text-tertiary, #94a3b8);
    // Default invisible — only fades in on hover/focus of the parent
    // title-row. Emil: inline hints should be quiet by default and
    // "earn" their visibility through interaction.
    opacity: 0;
    transform: translateX(4px);
    transition:
      opacity 200ms var(--ease-out),
      transform 200ms var(--ease-out);
  }
  &__title-row:hover &__drag-hint,
  &__title-row:focus-within &__drag-hint {
    opacity: 0.9;
    transform: translateX(0);
  }
  &__drag-hint-icon {
    flex-shrink: 0;
    color: var(--it-text-tertiary);
  }

  // ----- Grid (when has favorites) -----
  &__grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    width: 100%;
    box-sizing: border-box;
    column-gap: 12px;
    row-gap: 12px;

    @media (min-width: 640px)  { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    @media (min-width: 768px)  { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    @media (min-width: 1280px) { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  }
  &__cell {
    min-width: 0;
    display: flex;
    align-self: stretch;
    position: relative;
    cursor: grab;
    border: 2px solid transparent;
    border-radius: 10px;
    width: 100%;
    box-sizing: border-box;
    transition: border-color 200ms var(--ease-out),
                background-color 200ms var(--ease-out),
                opacity 200ms var(--ease-out);

    &:active { cursor: grabbing; }
  }
  &__cell--ghost {
    border-color: var(--ghost-border);
    border-style: dashed;
    background-color: var(--ghost-bg);
    opacity: 0.55;
  }
  &__cell--drag {
    border-color: var(--brand-primary);
    background-color: var(--el-color-primary-light-9, #ecfeff);
    box-shadow: 0 10px 24px var(--drag-shadow);
    cursor: grabbing;
    transform: rotate(-1.5deg);
  }

  // ----- Empty state -----
  &__empty {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 18px 22px;
    background-color: var(--brand-primary-soft);
    border: 1px dashed var(--brand-primary);
    border-radius: 10px;
    color: var(--it-text-secondary);
    animation: it-card-in 360ms var(--ease-out) both;
    animation-delay: 80ms;
  }
  &__empty-icon {
    flex-shrink: 0;
    color: var(--brand-primary);
    // Slow heartbeat — calls attention without being distracting.
    animation: it-heartbeat 1.8s var(--ease-in-out) infinite;
    transform-origin: center;
  }
  &__empty-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--it-text-primary);
    line-height: 1.3;
  }
  &__empty-desc {
    margin-top: 2px;
    font-size: 12.5px;
    color: var(--it-text-secondary);
    line-height: 1.5;
  }
}

@keyframes it-heartbeat {
  0%, 100% { transform: scale(1); }
  20%      { transform: scale(1.18); }
  40%      { transform: scale(1); }
  60%      { transform: scale(1.1); }
  80%      { transform: scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  .favorites__empty-icon { animation: none; }
}
</style>
