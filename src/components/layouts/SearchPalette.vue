<!-- 搜索下拉面板组件 -->

<template>
  <transition name="search-palette-fade">
    <div v-if="open" class="search-palette" @mousedown.stop>
      <div v-if="hasQuery" class="search-palette__header">
        <h3 class="search-palette__title">{{ t('palette.title') }}</h3>
        <span v-if="filtered.length > 0" class="search-palette__count">{{ filtered.length }}</span>
      </div>

      <div v-if="!hasQuery" class="search-palette__empty search-palette__empty--hint">
        <el-icon :size="18"><Search /></el-icon>
        <span>{{ t('palette.hint.empty') }}</span>
      </div>

      <div v-else-if="filtered.length === 0" class="search-palette__empty">
        <el-icon :size="20"><Search /></el-icon>
        <span>{{ noResultText }}</span>
      </div>

      <ul v-else class="search-palette__list" role="listbox">
        <li
          v-for="(tool, idx) in filtered"
          :key="tool.path"
          :ref="(el) => setItemRef(el as HTMLElement | null, idx)"
          :class="['search-palette__item', { 'is-active': idx === activeIndex }]"
          role="option"
          :aria-selected="idx === activeIndex"
          :style="{ '--i': idx }"
          @mouseenter="onItemEnter(idx)"
          @mousedown.prevent="select(tool)"
        >
          <span class="search-palette__icon">
            <svg
              :width="20"
              :height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <component :is="getToolIcon(tool.icon)" />
            </svg>
          </span>
          <div class="search-palette__text">
            <div class="search-palette__name">{{ tool.name }}</div>
            <div class="search-palette__desc">{{ tool.desc }}</div>
          </div>
          <el-icon
            v-if="idx === activeIndex"
            class="search-palette__enter"
            :size="14"
          >
            <Right />
          </el-icon>
        </li>
      </ul>

      <div class="search-palette__footer">
        <template v-if="hasQuery && filtered.length > 0">
          <span class="search-palette__hint">
            <kbd>↑</kbd><kbd>↓</kbd> {{ t('palette.hint.nav') }}
          </span>
          <span class="search-palette__hint">
            <kbd>↵</kbd> {{ t('palette.hint.open') }}
          </span>
        </template>
        <span class="search-palette__hint">
          <kbd>Esc</kbd> {{ t('palette.hint.close') }}
        </span>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { Search, Right } from '@element-plus/icons-vue'
import { useT } from '~/composables/useT'
import { useLocalizedTools, type Tool } from '~/composables/useTools'
import { getToolIcon } from '~/components/cards/toolIconRegistry'

const props = defineProps<{
  query: string
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:query', value: string): void
  (e: 'update:open', value: boolean): void
  (e: 'select', tool: Tool): void
}>()

const { t } = useT()
const hasQuery = computed(() => props.query.trim().length > 0)

const noResultText = computed(() => t('palette.hint.noResult', { q: props.query }))

const { localizedTools } = useLocalizedTools()
const filtered = computed<Tool[]>(() => {
  const q = props.query.trim().toLowerCase()
  const list = q
    ? localizedTools.value.filter((tool) =>
        tool.name.toLowerCase().includes(q) ||
        tool.desc.toLowerCase().includes(q) ||
        tool.path.toLowerCase().includes(q),
      )
    : localizedTools.value
  return list.slice(0, 20)
})

const activeIndex = ref(0)

// After a query change, the list re-flows but the mouse pointer
// stays where it was. If a new item now sits under the pointer, the
// browser fires mouseenter on it — and that would yank activeIndex
// off the freshly-reset 0, making the second item appear "selected"
// on every keystroke. Lock out mouseenter for 120ms after each
// reflow so the user's intentional hover still works, but the
// accidental "the list moved under my cursor" hover doesn't.
const mouseEnterLockedUntil = ref(0)
function onItemEnter(idx: number) {
  if (Date.now() < mouseEnterLockedUntil.value) return
  activeIndex.value = idx
}
watch(filtered, () => {
  activeIndex.value = 0
  scrollActiveIntoView()
  mouseEnterLockedUntil.value = Date.now() + 120
})

// Keep the highlighted row in view when arrow keys move it off-screen.
const itemRefs = ref<(HTMLElement | null)[]>([])
function setItemRef(el: HTMLElement | null, idx: number) {
  itemRefs.value[idx] = el
}
function scrollActiveIntoView() {
  nextTick(() => {
    const el = itemRefs.value[activeIndex.value]
    el?.scrollIntoView({ block: 'nearest' })
  })
}

function select(tool: Tool) {
  emit('select', tool)
}

// Called by BaseHeader when the input gets a keydown event.
// Returns true if we consumed the event (prevents default), so the
// parent can short-circuit form submit / whatever else it does.
function handleKeydown(e: KeyboardEvent): boolean {
  if (!props.open) return false
  if (filtered.value.length === 0) {
    if (e.key === 'Escape') {
      emit('update:open', false)
      return true
    }
    return false
  }
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      activeIndex.value = (activeIndex.value + 1) % filtered.value.length
      scrollActiveIntoView()
      return true
    case 'ArrowUp':
      e.preventDefault()
      activeIndex.value =
        (activeIndex.value - 1 + filtered.value.length) % filtered.value.length
      scrollActiveIntoView()
      return true
    case 'Enter':
      e.preventDefault()
      select(filtered.value[activeIndex.value])
      return true
    case 'Escape':
      e.preventDefault()
      emit('update:open', false)
      return true
  }
  return false
}

defineExpose({ handleKeydown })
</script>

<style lang="scss" scoped>
.search-palette {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  width: 100%;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  background-color: var(--it-bg-elevated);
  border: 1px solid var(--it-border);
  border-radius: 8px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.22);
  overflow: hidden;
  z-index: 200;
}

.search-palette__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px 8px;
  border-bottom: 1px solid var(--it-border);
}

.search-palette__title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--it-text-tertiary);
  letter-spacing: 0.02em;
}

.search-palette__count {
  font-size: 12px;
  color: var(--it-text-tertiary);
  background-color: var(--brand-tint);
  padding: 1px 8px;
  border-radius: 999px;
}

.search-palette__list {
  list-style: none;
  margin: 0;
  padding: 6px;
  overflow-y: auto;
  flex: 1 1 auto;
  min-height: 0;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb {
    background: var(--brand-tint-strong);
    border-radius: 3px;
  }
}

.search-palette__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--it-text-primary);
  transition: background-color 150ms var(--ease-out),
              color 150ms var(--ease-out);

  // Staggered entrance — each item slides 4px up + fades in. The
  // parent transition group runs the animation only on enter, not
  // on every re-render.
  animation: it-palette-item-in 220ms var(--ease-out) both;
  animation-delay: calc(var(--i, 0) * 22ms);
  @keyframes it-palette-item-in {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  &.is-active {
    // We hardcode the active background instead of var(--el-color-primary)
    // because the Element Plus CSS-var layer isn't always injected at
    // :root on this project; falling back to --el-color-primary would
    // resolve to an empty value and leave the row transparent.
    background-color: var(--brand-primary);
    color: #fff;

    .search-palette__desc { color: rgba(255, 255, 255, 0.85); }
    .search-palette__icon { color: #fff; }
  }
  &:not(.is-active):hover {
    background-color: var(--it-sider-hover, rgba(0, 0, 0, 0.06));
  }
}

.search-palette__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 6px;
  background-color: var(--brand-tint);
  color: var(--it-text-tertiary);
}

.search-palette__item.is-active .search-palette__icon {
  background-color: rgba(255, 255, 255, 0.2);
}

.search-palette__text {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.search-palette__name {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.search-palette__desc {
  font-size: 12px;
  line-height: 1.4;
  color: var(--it-text-secondary);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.search-palette__enter {
  flex-shrink: 0;
  opacity: 0.85;
}

.search-palette__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 16px;
  font-size: 13px;
  color: var(--it-text-tertiary);
}

.search-palette__empty--hint {
  padding: 24px 16px;
  opacity: 0.8;
}

.search-palette__footer {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 14px;
  border-top: 1px solid var(--it-border);
  font-size: 11px;
  color: var(--it-text-tertiary);
}

.search-palette__hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.search-palette__hint kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10px;
  background-color: rgba(0, 0, 0, 0.06);
  border: 1px solid var(--it-border);
  border-radius: 3px;
  color: var(--it-text-secondary);
}

:global(html.dark) .search-palette__hint kbd {
  background-color: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
}

// Open/close fade — use a stronger easing for "punchy" entrance,
// gentler exit. The panel appears to "settle" rather than fade in.
.search-palette-fade-enter-active {
  transition: opacity 140ms var(--ease-out),
              transform 180ms var(--ease-out);
}
.search-palette-fade-leave-active {
  transition: opacity 100ms ease-in, transform 100ms ease-in;
}
.search-palette-fade-enter-from,
.search-palette-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
  transform-origin: top center;
}
</style>
