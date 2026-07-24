<!--
  英雄区：标题 + 标语 + 支持说明 + 分类 tab 整张卡。

  用 v-model:category 与父组件共享当前选中的分类（父组件用来
  过滤下方的工具网格），工具列表通过 :tools 传入，仅用于计算每个
  tab 的数量徽章。
-->

<template>
  <section class="hero">
    <h1 class="hero__title">gzzz-tools</h1>
    <p class="hero__tagline">
      <i18n-t keypath="home.hero.tagline" tag="span">
        <template #count>
          <strong class="hero__count">{{ Math.round(animatedCount) }}</strong>
        </template>
      </i18n-t>
    </p>
    <p class="hero__support-note">
      <i18n-t keypath="home.hero.supportNote" tag="span">
        <template #github>
          <a class="hero__support-link" :href="GITHUB_REPO_URL" target="_blank" rel="noopener">GitHub</a>
        </template>
        <template #gitee>
          <a class="hero__support-link" :href="GITEE_REPO_URL" target="_blank" rel="noopener">Gitee</a>
        </template>
      </i18n-t>
    </p>

    <div class="hero__tabs" role="tablist">
      <button
        v-for="(tab, idx) in tabs"
        :key="tab.key"
        type="button"
        role="tab"
        :aria-selected="category === tab.key"
        :tabindex="category === tab.key ? 0 : -1"
        :class="['hero__tab', { 'is-active': category === tab.key }]"
        :style="{ '--i': idx }"
        @click="setCategory(tab.key)"
        @keydown.left.prevent="moveTab(-1)"
        @keydown.right.prevent="moveTab(1)"
      >
        <span class="hero__tab-label">{{ tab.label }}</span>
        <span class="hero__tab-count">{{ tab.count }}</span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useTransition } from '@vueuse/core'
import { useT } from '~/composables/useT'
import { type Tool } from '~/composables/useTools'
import { CATEGORIES, type TabKey } from '~/tools/registry'
import { GITHUB_REPO_URL, GITEE_REPO_URL } from '~/config/repos'

// ----- Props / v-model -----
const props = defineProps<{
  /** Currently selected category, owned by the parent so the tool
   *  grid below the hero can read it. */
  category: TabKey
  /** Full tool list — used to compute per-tab counts. */
  tools: Tool[]
}>()
const emit = defineEmits<{
  (e: 'update:category', value: TabKey): void
}>()

const { t } = useT()

const totalCount = computed(() => props.tools.length)

// ----------------------------------------------------------------
// Animated count-up for the total tools number. useTransition (not
// useSpring — the project has VueUse, not framer-motion) drives a
// single progress from 0 → 1, then we multiply by target.
//
// Why easeOutCubic instead of easeOutBack / spring: the count is
// rendered as an integer via Math.round, and any overshoot in the
// curve becomes a visible "16 → 18 → 16" stutter. Spring-style
// overshoot only reads as spring on continuous values; on integers
// it reads as a bug. easeOutCubic gives a quick start + smooth
// settle without ever exceeding 1.0, so the integer is monotonic.
// ----------------------------------------------------------------
const countSource = ref(0)
const animatedCount = useTransition(countSource, {
  duration: 1200,
  transition: [0.33, 1, 0.68, 1],
})
onMounted(() => {
  countSource.value = props.tools.length
})

const tabs = computed(() => [
  { key: 'all' as TabKey, label: t('home.tab.all'), count: props.tools.length },
  ...CATEGORIES.map((c) => ({
    key: c.key as TabKey,
    label: t(c.i18nKey),
    count: props.tools.filter((tool) => tool.category === c.key).length,
  })),
])

function setCategory(key: TabKey) {
  emit('update:category', key)
}

// Arrow-key navigation across the tab strip — discoverable but not
// chatty (no focus-ring flash, no scroll into view).
function moveTab(delta: number) {
  const keys = tabs.value.map((tab) => tab.key)
  const idx = keys.indexOf(props.category)
  const next = (idx + delta + keys.length) % keys.length
  setCategory(keys[next])
  nextTick(() => {
    const el = document.querySelector<HTMLButtonElement>('.hero__tab.is-active')
    el?.focus({ preventScroll: true })
  })
}
</script>

<style lang="scss" scoped>
// Single hero panel: title + tagline + support note + tabs, all on a
// soft brand-blue gradient. The original "Follow us" banner card was
// flattened into this layout — the support copy now sits as a quiet
// line below the tagline, with the GitHub / Gitee links inline.
.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 22px 24px 20px;
  // Banner gradient promoted to the hero background.
  background: var(--gradient-follow);
  border-radius: 12px;
  color: #fff;
  overflow: hidden;
  isolation: isolate;
  box-sizing: border-box;
  transition:
    transform 240ms var(--ease-out),
    box-shadow 240ms var(--ease-out);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);

  // Two radial highlights — softened to match the lighter base.
  // The white highlight was 0.28 in v4, way too strong over a
  // light-blue field; 0.16 keeps the depth without blowing out.
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
    radial-gradient(circle at 92% 8%, rgba(255, 255, 255, 0.28) 0%, transparent 35%),
    radial-gradient(circle at 8% 100%, rgba(125, 211, 252, 0.22) 0%, transparent 45%);
    pointer-events: none;
    z-index: 0;
  }

  // Subtle shine sweep on hover — kept from the old support card.
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -120%;
    width: 60%;
    height: 100%;
    background: linear-gradient(
      100deg,
      transparent 0%,
      rgba(255, 255, 255, 0.12) 50%,
      transparent 100%
    );
    transform: skewX(-18deg);
    transition: left 800ms var(--ease-out);
    pointer-events: none;
    z-index: 0;
  }
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(30, 58, 138, 0.32);
      &::after { left: 130%; }
    }
  }

  &__title {
    position: relative;
    z-index: 1;
    margin: 0;
    font-size: 26px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #fff;
    line-height: 1.15;
    animation: hero-title-in 480ms var(--ease-out) both;
    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
    @keyframes hero-title-in {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  }

  &__tagline {
    position: relative;
    z-index: 1;
    margin: 4px 0 0;
    font-size: 13.5px;
    line-height: 1.55;
    color: rgba(255, 255, 255, 0.9);
    max-width: 64ch;
  }
  &__count {
    font-weight: 800;
    color: #fff;
    // Tabular figures so each digit occupies the same advance width
    // — without this, "1" → "16" mid-count would jitter as the
    // number's visual width changes. Inline with the count-up.
    font-variant-numeric: tabular-nums;
    // Slight underline so the count stands out without breaking flow.
    border-bottom: 1px dashed rgba(255, 255, 255, 0.45);
    padding-bottom: 1px;
  }

  // Visual hierarchy: the tagline is the "what is this site" line, the
  // support note is a quiet "btw, here's how to support" — smaller
  // and lower contrast so it doesn't compete with the main tagline.
  &__support-note {
    position: relative;
    z-index: 1;
    margin: 6px 0 0;
    font-size: 12.5px;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.72);
  }
  &__support-link {
    color: #fff;
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 2px;
    text-decoration-color: rgba(255, 255, 255, 0.5);
    transition: text-decoration-color 200ms var(--ease-out),
                color 200ms var(--ease-out);

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        text-decoration-color: #fff;
        color: #fff;
      }
    }
    &:focus-visible {
      outline: 2px solid #fff;
      outline-offset: 2px;
      border-radius: 2px;
    }
  }

  &__tabs {
    position: relative;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 14px;
  }

  &__tab {
    // Stagger each tab's entrance just like the tool cards.
    animation: hero-tab-in 380ms var(--ease-out) both;
    animation-delay: calc(120ms + var(--i, 0) * 50ms);

    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 32px;
    padding: 0 14px;
    background-color: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    user-select: none;
    transition:
      background-color 200ms var(--ease-out),
      color 200ms var(--ease-out),
      border-color 200ms var(--ease-out),
      transform 160ms var(--ease-out);

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        background-color: rgba(255, 255, 255, 0.22);
        color: #fff;
        border-color: rgba(255, 255, 255, 0.35);
      }
    }
    &:active { transform: scale(0.97); }
    &:focus-visible {
      outline: 2px solid #fff;
      outline-offset: 2px;
    }

    &.is-active {
      background-color: #fff;
      color: var(--brand-primary-deep);
      border-color: #fff;
      font-weight: 600;
    }

    @keyframes hero-tab-in {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  }

  &__tab-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    font-size: 11px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
    background-color: rgba(255, 255, 255, 0.18);
    border-radius: 999px;
    transition: background-color 200ms var(--ease-out),
                color 200ms var(--ease-out);
  }
  &__tab.is-active &__tab-count {
    background-color: var(--brand-primary-soft);
    color: var(--brand-primary-deep);
  }
}
</style>
