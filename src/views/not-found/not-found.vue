<!-- 404 page -->
<template>
  <ToolPage
    preset="medium-form"
    :title="t('notFound.title')"
    :subtitle="t('notFound.desc')"
  >
    <CardPane
      class="not-found-card"
      body-padding="40px"
      body-mobile-padding="32px 24px 28px"
    >
      <div class="not-found-card__code">404</div>

      <el-button
        type="primary"
        size="large"
        class="not-found-card__home"
        @click="goHome"
      >
        {{ t('notFound.home') }}
      </el-button>

      <div class="not-found-card__quick">
        <span class="not-found-card__quick-label">
          {{ t('notFound.quickLabel') }}
        </span>
        <div class="not-found-card__quick-list">
          <router-link
            v-for="tool in quickTools"
            :key="tool.path"
            :to="tool.path"
            class="not-found-card__quick-link"
          >
            {{ tool.name }}
          </router-link>
        </div>
      </div>
    </CardPane>
  </ToolPage>
</template>

<script setup lang="ts">
import { useT } from '~/composables/useT'
import { useRouter } from 'vue-router'
import { useLocalizedTools, type Tool } from '~/composables/useTools'

const { t } = useT()
const router = useRouter()

// Show three most-used tools as a "you might want…" escape hatch.
// JSON / Hash / Base64 are the ones users come here for most often.
const { localizedTools } = useLocalizedTools()
const order = ['/json', '/hash', '/base64']
const quickTools: Tool[] = order
  .map((p) => localizedTools.value.find((x) => x.path === p))
  .filter((x): x is Tool => Boolean(x))

function goHome () {
  router.push('/')
}
</script>

<style lang="scss" scoped>
// Constrain the card width — 404 is content-light, full medium-form
// (800px) would feel like a half-empty tool page. Center it.
.not-found-card {
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}

.not-found-card__code {
  // Reuse the brand gradient triple-stop so "404" reads as the same
  // family as the Follow banner — a single accent moment, not a
  // competing visual.
  font-size: 96px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.02em;
  background: var(--gradient-follow);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 0 0 28px;
}

.not-found-card__home {
  // Slightly wider than the el-button default so the CTA reads as
  // the obvious next step, not just one button among many.
  min-width: 160px;
}

.not-found-card__quick {
  // Hairline separator above the "or try one of these" row — uses the
  // same border color as the card so the divider never goes "grey
  // on grey" in dark mode.
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid var(--it-border);
}

.not-found-card__quick-label {
  display: block;
  font-size: 12px;
  color: var(--it-text-tertiary);
  margin-bottom: 12px;
  letter-spacing: 0.04em;
}

.not-found-card__quick-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 12px;
}

.not-found-card__quick-link {
  // Inline chip — keeps the secondary CTA group from competing with
  // the primary button. Inherits brand color from the global <a>
  // style, plus a subtle hover bg so they read as clickable.
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 13px;
  color: var(--brand-primary);
  text-decoration: none;
  transition: background-color var(--it-transition), color var(--it-transition);

  &:hover {
    background-color: var(--brand-primary-soft);
    color: var(--brand-primary-strong);
  }
}

@media (max-width: 600px) {
  .not-found-card__code { font-size: 80px; }
}
</style>
