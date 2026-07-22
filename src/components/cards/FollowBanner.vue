<!-- 首页关注横幅组件 -->

<template>
  <a
    href="https://github.com/gzzzxx/gzzz-tool-show"
    target="_blank"
    rel="noopener"
    class="it-follow-banner follow-banner"
  >
    <div class="it-follow-banner__head follow-banner__head">
      <svg
        class="it-follow-banner__icon follow-banner__icon"
        :width="iconSize"
        :height="iconSize"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <component :is="starIcon" />
      </svg>
    </div>
    <h3 class="it-follow-banner__title follow-banner__title">
      {{ titleText }}
    </h3>
    <div class="it-follow-banner__desc follow-banner__desc">
      <i18n-t keypath="home.banner.desc" tag="span">
        <template #github>
          <a
            href="https://github.com/gzzzxx/gzzz-tool-show"
            target="_blank"
            rel="noopener"
          >GitHub</a>
        </template>
        <template #gitee>
          <a
            href="https://gitee.com/gzzzxx/gzzz-tool-show"
            target="_blank"
            rel="noopener"
          >Gitee</a>
        </template>
      </i18n-t>
    </div>
  </a>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useT } from '~/composables/useT'
import { getUiIcon } from './toolIconRegistry'

const props = withDefaults(
  defineProps<{
    title?: string
  }>(),
  {
    title: '',
  },
)

const { t } = useT()
const titleText = computed(() => props.title || t('home.banner.title'))

const iconSize = 28

const starIcon = getUiIcon('star')
</script>

<style lang="scss" scoped>
.follow-banner {
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
}

.follow-banner__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.follow-banner__icon {
  flex-shrink: 0;
  display: block;
}
</style>
