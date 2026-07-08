<!--
  encryption.vue — SM4 / AES encrypt/decrypt.

  Hosts the algorithm tab switcher (SM4 ↔ AES) and renders the shared
  encryptionDetail.vue body underneath. The tab content itself is
  algorithm-agnostic; the only difference between SM4 and AES is
  which crypto function is called inside the detail component (driven
  by the `algorithm` prop, passed through from the route).

  Same card-based shell family as sql.vue / xml.vue / json.vue / base64.vue:
    .encryption-page    → max-width centered shell + soft shadow
    .encryption-tabs    → centered tab nav (overrides el-tabs default
                          alignment + uses brand-primary for the
                          active indicator)

  The tab click handler preserves the original (admittedly quirky)
  behavior: `algorithm` is a plain `let` that gets mutated on tab
  click. We deliberately don't "fix" this to keep the refactor
  scoped to style only — the user asked to preserve functionality.
-->
<template>
  <ToolPage
    class="encryption-page"
    preset="large-form"
    :title="title"
    :subtitle="subtitle"
  >

    <div class="encryption-tabs">
      <el-tabs v-model="activeName" class="encryption-tabs__nav" @tab-click="handleClick">
        <el-tab-pane label="SM4" name="SM4">
          <detail :algorithm="algorithm" />
        </el-tab-pane>
        <el-tab-pane label="AES" name="AES">
          <detail :algorithm="algorithm" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </ToolPage>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import detail from './encryptionDetail.vue'

// algorithm 由路由 props 传入（registry 里 SM4 / AES 各传一份），
// 不再从 route.params 读，避开 alias 模式下两个 path 共享一条
// :id 路由带来的 params 解析问题。
const props = defineProps<{ algorithm: string }>()

const { t } = useI18n({ useScope: 'global' })

// 用 ref 而非 let — ref 保持响应式 (let 不会触发依赖它的 watch/
// computed 重新计算, 是个隐性 bug 源); ref 让 :algorithm 绑定到
// detail 组件是真正的双向响应。
const activeName = ref(props.algorithm)
const algorithm = ref(props.algorithm)

// Title / subtitle derived from the active algorithm so the page
// header reflects whichever route we're on (/encryption/SM4 vs
// /encryption/AES) without each route needing a custom heading.
const title = computed(() => t(`tools.${props.algorithm.toLowerCase()}.name`))
const subtitle = computed(() => t(`tools.${props.algorithm.toLowerCase()}.desc`))

const handleClick = (tab: { props: { label: string } }) => {
  algorithm.value = tab.props.label
}
</script>

<style lang="scss" scoped>
/* Outer wrapper — same shell family as the other dev tools. 1200px
   (narrower than sql.vue's 1600px) since the form has a 3:1 column
   ratio and the narrower side doesn't need full 1600.
   页面尺寸由 <ToolPage preset="large-form"> 提供。 */
/* Tabs — el-tabs defaults to left-aligned; we center the nav row
   and tint the active indicator with the brand color so it matches
   the rest of the app's accent palette. */
.encryption-tabs :deep(.ep-tabs__header) {
  justify-content: center;
  margin-bottom: 16px;
}
.encryption-tabs :deep(.ep-tabs__item) {
  font-size: 15px;
  font-weight: 500;
  padding: 0 20px;
}
.encryption-tabs :deep(.ep-tabs__item.is-active) {
  color: var(--brand-primary);
  font-weight: 600;
}
.encryption-tabs :deep(.ep-tabs__active-bar) {
  background-color: var(--brand-primary);
}

@media (max-width: 600px) {
  // .encryption-page padding + .encryption-title font-size 已由全局 _tool-page.scss 提供
  .encryption-tabs :deep(.ep-tabs__item) {
    padding: 0 12px;
    font-size: 14px;
  }
}
</style>
