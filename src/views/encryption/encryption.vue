<!-- 加密工具，支持 SM4 和 AES 算法切换 -->

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

const props = defineProps<{ algorithm: string }>()

const { t } = useI18n({ useScope: 'global' })

const activeName = ref(props.algorithm)
const algorithm = ref(props.algorithm)

const title = computed(() => t(`tools.${props.algorithm.toLowerCase()}.name`))
const subtitle = computed(() => t(`tools.${props.algorithm.toLowerCase()}.desc`))

const handleClick = (tab: { props: { label: string } }) => {
  algorithm.value = tab.props.label
}
</script>

<style lang="scss" scoped>
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
