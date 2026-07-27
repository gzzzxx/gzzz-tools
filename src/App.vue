<!--
  src/App.vue — root layout shell.
  Owns responsive breakpoint, PC sidebar collapse, mobile drawer, and the
  view-transition theme toggle. BaseHeader / BaseSide are dumb render-only.
-->
<template>
  <el-config-provider namespace="ep" :locale="elLocale">
    <div :class="['app-root', { 'is-mobile': isMobile }]">
      <aside
        v-if="!isMobile"
        :class="['app-root__sider', { 'is-collapsed': isSiderCollapsed }]"
      >
        <BaseSide
          :is-collapsed="isSiderCollapsed"
          @update:is-collapsed="isSiderCollapsed = $event"
          @navigate="onNavigate"
        />
      </aside>

      <div class="app-root__main">
        <BaseHeader
          :is-sider-collapsed="isSiderCollapsed"
          @toggle-sider="isSiderCollapsed = !isSiderCollapsed"
          @toggle-theme="onToggleTheme"
        />

        <main class="app-root__content">
          <router-view :key="$router.currentRoute.value.fullPath" />
        </main>
      </div>

      <el-drawer
        v-if="isMobile"
        v-model="drawerVisible"
        direction="ltr"
        :with-header="false"
        size="240px"
      >
        <BaseSide :is-collapsed="false" @navigate="onNavigate" />
      </el-drawer>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import { useT } from '~/composables/useT'
import { useTheme } from '~/composables/useTheme'
import { useRouter } from 'vue-router'

const { locale } = useT()
const elLocale = computed(() => (locale.value === 'en-US' ? en : zhCn))
const router = useRouter()

const isMobile = useMediaQuery('(max-width: 1023.98px)')

const isSiderCollapsed = ref(false)
const drawerVisible = ref(false)

function onNavigate(path: string) {
  drawerVisible.value = false
  if (path && path !== router.currentRoute.value.path) {
    router.push(path)
  }
}

const { toggleTheme } = useTheme()
function onToggleTheme(payload: { clientX: number; clientY: number }) {
  toggleTheme(payload)
}
</script>

<style lang="scss">
.app-root {
  display: flex;
  min-height: 100vh;
  background: var(--it-bg, #f1f5f9);
  color: var(--it-text-primary, #1e293b);
}

.app-root__sider {
  width: 240px;
  flex-shrink: 0;
  transition: width 0.2s ease;
  overflow: hidden;
  position: sticky;
  top: 0;
  height: 100vh;

  &.is-collapsed { width: 0; }
}

.app-root__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.app-root__content {
  flex: 1;
  min-height: 0;
}

.app-root.is-mobile {
  flex-direction: column;

  .app-root__main { width: 100%; }
}

::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
}

::view-transition-old(root) {
  z-index: 1;
}

::view-transition-new(root) {
  z-index: 2147483646;
}

@keyframes vt-shrink {
  from {
    clip-path: circle(
      var(--vt-radius)
      at
      var(--vt-x)
      var(--vt-y)
    );
  }
  to {
    clip-path: circle(
      0
      at
      var(--vt-x)
      var(--vt-y)
    );
  }
}

html:active-view-transition-type(light-to-dark) {
  &::view-transition-old(root) {
    z-index: 2147483646;
    animation: vt-shrink 400ms ease-in forwards;
  }
  &::view-transition-new(root) {
    z-index: 1;
  }
}

@keyframes vt-expand {
  from {
    clip-path: circle(
      0
      at
      var(--vt-x)
      var(--vt-y)
    );
  }
  to {
    clip-path: circle(
      var(--vt-radius)
      at
      var(--vt-x)
      var(--vt-y)
    );
  }
}

html:active-view-transition-type(dark-to-light) {
  &::view-transition-new(root) {
    z-index: 2147483646;
    animation: vt-expand 400ms ease-in forwards;
  }
}
</style>