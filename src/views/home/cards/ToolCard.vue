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
              @click.stop.prevent="toggle(tool.path)"
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
                class="tool-card__fav-svg"
              >
                <!-- :key forces remount on toggle → re-runs the bounce animation. -->
                <path
                  :key="isFav ? 'on' : 'off'"
                  class="tool-card__fav-path"
                  d="M12 21s-7-4.5-9.5-9.5C.8 7.5 3.5 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 3.5 0 6.2 3.5 4.5 7.5C19 16.5 12 21 12 21z"
                />
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
import { useT } from '~/composables/useT'
import { type Tool } from '~/composables/useTools'
import { useFavorites } from '~/composables/useFavorites'
import { getToolIcon } from '~/components/cards/toolIconRegistry'

const props = defineProps<{ tool: Tool }>()

const iconSize = 28
const favIconSize = 18

const iconPath = computed(() => getToolIcon(props.tool.icon))

const { isFavorite, toggle } = useFavorites()
const isFav = computed(() => isFavorite(props.tool.path))

const { t } = useT()
const favTooltip = computed(() =>
  isFav.value ? t('toolcard.favorite.remove') : t('toolcard.favorite.add'),
)
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
  // Gradient + soft drop shadow. Shadow slowly pulses — gives the
  // badge a "live" presence on a card that's otherwise static.
  position: relative;
  padding: 2px 8px;
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  color: #fff;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: 0.04em;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.55);
  animation: it-new-pulse 2.4s var(--ease-in-out) infinite;
}
@keyframes it-new-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.45); }
  50%      { box-shadow: 0 0 0 5px rgba(16, 185, 129, 0); }
}
@media (prefers-reduced-motion: reduce) {
  .tool-card__new { animation: none; }
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
  transition: color 200ms var(--ease-out),
              background-color 200ms var(--ease-out),
              transform 160ms var(--ease-out);

  // Touch devices trigger hover on tap — gate the grow.
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: var(--it-favorite);
      background-color: var(--it-favorite-soft);
      transform: scale(1.1);
    }
  }
  &:active { transform: scale(0.88); }
  &:focus-visible {
    outline: 2px solid var(--brand-primary);
    outline-offset: 1px;
  }

  // Filled state — teal heart.
  &.is-fav {
    color: var(--it-favorite);
    @media (hover: hover) and (pointer: fine) {
      &:hover {
        color: var(--it-favorite);
        background-color: var(--it-favorite-softer);
      }
    }
  }
}

// SVG container — drives the toggle bounce. The :key on <path> forces
// remount on every state flip, so the keyframe animation re-runs both
// directions (off→on and on→off).
.tool-card__fav-svg {
  display: block;
  transform-origin: center;
  // No transition on transform here — the animation owns the motion.
}
.tool-card__fav-path {
  animation: it-heart-bounce 320ms var(--ease-spring);
  transform-origin: center;
}
@keyframes it-heart-bounce {
  0%   { transform: scale(1); }
  35%  { transform: scale(0.82); }
  70%  { transform: scale(1.2); }
  100% { transform: scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  .tool-card__fav-path { animation: none; }
  .tool-card__fav { transition: color 0.15s ease, background-color 0.15s ease; }
}
</style>
