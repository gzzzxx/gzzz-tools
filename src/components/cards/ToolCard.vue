<!-- 首页工具卡片组件 -->

<template>
  <div class="it-tool-card tool-card">
    <router-link
      :to="tool.path"
      class="tool-card__link"
    >
      <div class="it-tool-card__head tool-card__head">
        <svg
          class="it-tool-card__icon tool-card__icon"
          :width="iconSize"
          :height="iconSize"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <component :is="iconPath" />
        </svg>
        <div class="tool-card__head-right">
          <span
            v-if="tool.isNew"
            class="tool-card__new"
          >NEW</span>
          <el-tooltip
            :content="favTooltip"
            placement="top"
            :show-after="120"
          >
            <button
              type="button"
              class="tool-card__fav"
              :class="{ 'is-fav': isFav }"
              :aria-label="favTooltip"
              :aria-pressed="isFav"
              @click.stop.prevent="onToggleFav"
            >
              <svg
                :width="favIconSize"
                :height="favIconSize"
                viewBox="0 0 24 24"
                :fill="isFav ? 'currentColor' : 'none'"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M12 21s-7-4.5-9.5-9.5C.8 7.5 3.5 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 3.5 0 6.2 3.5 4.5 7.5C19 16.5 12 21 12 21z" />
              </svg>
            </button>
          </el-tooltip>
        </div>
      </div>
      <div class="it-tool-card__name tool-card__name">{{ tool.name }}</div>
      <div class="it-tool-card__desc tool-card__desc">{{ tool.desc }}</div>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { type Tool } from '~/composables/useTools'
import { useFavorites } from '~/composables/useFavorites'
import { getToolIcon } from '~/components/cards/toolIconRegistry'

const props = defineProps<{ tool: Tool }>()

const iconSize = 28
const favIconSize = 18

const iconPath = computed(() => getToolIcon(props.tool.icon))

const { isFavorite, toggle } = useFavorites()
const isFav = computed(() => isFavorite(props.tool.path))

const { t } = useI18n({ useScope: 'global' })
const favTooltip = computed(() =>
  isFav.value ? t('toolcard.favorite.remove') : t('toolcard.favorite.add'),
)

function onToggleFav() {
  toggle(props.tool.path)
}
</script>

<style lang="scss" scoped>
.tool-card__link {
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-decoration: none;
  color: inherit;
  height: 100%;
  min-width: 0;
}

.tool-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tool-card__head-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.tool-card__icon {
  flex-shrink: 0;
  display: block;
}

.tool-card__new {
  padding: 2px 8px;
  background: var(--el-color-success, #67c23a);
  color: #fff;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.4;
}

.tool-card__fav {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--it-text-tertiary, #94a3b8);
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease, transform 0.15s ease;

  &:hover {
    color: var(--it-favorite);
    background-color: var(--it-favorite-soft);
  }
  &:active { transform: scale(0.92); }
  &:focus-visible {
    outline: 2px solid var(--brand-primary);
    outline-offset: 1px;
  }

  // Filled state — teal heart.
  &.is-fav {
    color: var(--it-favorite);
    &:hover {
      color: var(--it-favorite);
      background-color: var(--it-favorite-softer);
    }
  }

  svg { display: block; }
}
</style>
