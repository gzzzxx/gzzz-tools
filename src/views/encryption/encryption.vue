<!-- 加密工具，支持 SM4 和 AES 算法切换 -->

<template>
  <ToolPage
    class="encryption-page"
    preset="large-form"
    :title="title"
    :subtitle="subtitle"
  >

    <div class="tab-bar" role="tablist">
      <button
        class="tab-bar__item"
        :class="{ 'tab-bar__item--active': algorithm === 'SM4' }"
        role="tab"
        :aria-selected="algorithm === 'SM4'"
        @click="setAlgorithm('SM4')"
      >
        SM4
      </button>
      <button
        class="tab-bar__item"
        :class="{ 'tab-bar__item--active': algorithm === 'AES' }"
        role="tab"
        :aria-selected="algorithm === 'AES'"
        @click="setAlgorithm('AES')"
      >
        AES
      </button>
    </div>

    <detail :algorithm="algorithm" />
  </ToolPage>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useT } from '~/composables/useT'
import { useRoute, useRouter } from 'vue-router'
import detail from './encryptionDetail.vue'

// 真值从 URL 解析, 不依赖 route props
type Algo = 'SM4' | 'AES'

const { t } = useT()
const route = useRoute()
const router = useRouter()

function parseAlgoFromPath(path: string): Algo {
  const m = path.match(/^\/encryption\/(SM4|AES)$/)
  return (m?.[1] as Algo) ?? 'SM4'
}

const algorithm = ref<Algo>(parseAlgoFromPath(route.path))

const title = computed(() => t(`tools.${algorithm.value.toLowerCase()}.name`))
const subtitle = computed(() => t(`tools.${algorithm.value.toLowerCase()}.desc`))

function setAlgorithm(algo: Algo) {
  if (algorithm.value === algo) return
  algorithm.value = algo
  router.replace({ path: `/encryption/${algo}` })
}

// 浏览器前进/后退时同步 algorithm
watch(() => route.path, (newPath) => {
  const next = parseAlgoFromPath(newPath)
  if (next !== algorithm.value) algorithm.value = next
})
</script>

<style lang="scss" scoped>

@media (max-width: 600px) {
  .tab-bar__item { padding: 8px 16px; font-size: 14px; }
}
</style>
