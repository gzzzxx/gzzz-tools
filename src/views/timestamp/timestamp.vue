<template>
  <ToolPage
    class="timestamp-page"
    preset="medium-form"
    :title="t('tools.timestamp.name')"
    :subtitle="t('tools.timestamp.desc')"
  >
    <CardPane class="input-card" body-padding="20px" radius="8px">
      <el-row :gutter="20" style="margin-bottom: 16px;">
        <el-col :span="24">
          <div class="date-picker-wrapper">
            <el-date-picker
              v-model="datePickerValue"
              type="datetime"
              :placeholder="t('timestampPage.input.datePickerPlaceholder')"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%; max-width: 300px;"
              @change="onDatePickerChange"
              clearable
              class="custom-date-picker"
            />
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" align="middle">
        <el-col :span="12">
          <el-input
            v-model="timestamp"
            :placeholder="t('timestampPage.input.timestampPlaceholder')"
            @input="onTimestampInput"
            prefix-icon="el-icon-time"
            clearable
          />
        </el-col>
        <el-col :span="12">
          <el-input
            v-model="dateString"
            :placeholder="t('timestampPage.input.dateStringPlaceholder')"
            @input="onDateInput"
            prefix-icon="el-icon-date"
            clearable
          />
        </el-col>
      </el-row>
    </CardPane>
    <el-row :gutter="20" class="result-row">
      <el-col :span="12">
        <CardPane class="result-card" radius="8px">
          <div class="result-label">{{ t('timestampPage.result.date') }}</div>
          <div class="result-row-flex">
            <span class="result-value">{{ formattedDate }}</span>
            <el-button
              v-if="formattedDate"
              size="small"
              :icon="DocumentCopy"
              @click="copyToClipboard(formattedDate)"
              class="copy-btn"
              circle
            />
          </div>
        </CardPane>
      </el-col>
      <el-col :span="12">
        <CardPane class="result-card" radius="8px">
          <div class="result-label">{{ t('timestampPage.result.timestamp') }}</div>
          <div class="result-row-flex">
            <span class="result-value">{{ formattedTimestamp }}</span>
            <el-button
              v-if="formattedTimestamp"
              size="small"
              :icon="DocumentCopy"
              @click="copyToClipboard(formattedTimestamp)"
              class="copy-btn"
              circle
            />
          </div>
        </CardPane>
      </el-col>
    </el-row>
  </ToolPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DocumentCopy } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { useClipboard } from '~/composables/useClipboard'
import { formatDateTime } from '~/utils/datetime'

const { t } = useI18n({ useScope: 'global' })
const clipboard = useClipboard()

const timestamp = ref('');
const dateString = ref('');
const formattedDate = ref('');
const formattedTimestamp = ref('');
const datePickerValue = ref<string | null>(null);

function onTimestampInput() {
  let ts = timestamp.value.trim();
  if (!ts) {
    formattedDate.value = '';
    return;
  }
  // 支持秒和毫秒
  if (ts.length === 10) ts = ts + '000';
  const num = Number(ts);
  if (!isNaN(num)) {
    const date = new Date(num);
    if (!isNaN(date.getTime())) {
      formattedDate.value = formatDateTime(date);
      dateString.value = formatDateTime(date);
      datePickerValue.value = formatDateTime(date);
    } else {
      formattedDate.value = t('timestampPage.error.invalidTimestamp');
    }
  } else {
    formattedDate.value = t('timestampPage.error.invalidTimestamp');
  }
}

function onDateInput() {
  const str = dateString.value.trim();
  if (!str) {
    formattedTimestamp.value = '';
    formattedDate.value = '';
    return;
  }
  const date = new Date(str.replace(/-/g, '/'));
  if (!isNaN(date.getTime())) {
    formattedTimestamp.value = date.getTime().toString();
    timestamp.value = date.getTime().toString();
    datePickerValue.value = str;
    formattedDate.value = formatDateTime(date);
  } else {
    formattedTimestamp.value = t('timestampPage.error.invalidDate');
    formattedDate.value = '';
  }
}

function onDatePickerChange(val: string) {
  if (val) {
    dateString.value = val;
    onDateInput();
  }
}

function copyToClipboard(text: string) {
  clipboard.copy(text);
}
</script>

<style lang="scss" scoped>
/* Page-level wrapper sizing is provided by <ToolPage preset="medium-form"> */
/* border-radius 由 <CardPane radius="8px"> 提供 */
.input-card {
  margin-bottom: 24px;
}
.result-row {
  margin-top: 12px;
}
.result-card {
  /* flex: 1 让 result-card 在 CardPane body (display: flex; flex-direction: column)
     里 grow 到父高 — 不然 result-card 高度被 min-height 钉死在 120px,
     justify-content: center 只能在这 120px 内"假装"居中, 视觉上仍然贴顶. */
  display: flex;
  flex-direction: column;
  /* 整体内容 (label + row) 在 box 内水平+垂直居中. 改 align-items:
     center 替代 flex-start — 之前 label 顶左对齐, 数字顶左对齐, 看起来
     整个内容"挤左上". */
  justify-content: center;
  align-items: center;
  background: var(--it-card-result-bg);
}
.result-label {
  color: var(--it-text-secondary);
  font-size: 0.95rem;
  margin-top: 8px;
  align-self: center;
}
.result-row-flex {
  display: flex;
  align-items: center;
  /* 居中展示 value + 复制按钮: 之前用 space-between 把按钮推到
     最右, 数字顶到最左, 视觉上偏左. 改 center 后 value + button
     作为一组在 row 水平居中. flex-wrap 让超长 timestamp 换行
     不会撑破 row. */
  justify-content: center;
  min-height: 38px;
  gap: 8px;
  flex-wrap: wrap;
}
.result-value {
  /* 不再 flex: 1 — 让 value 按内容自身宽度 + text-align 居中,
     长 timestamp 会按 word-break 换行, 不再把按钮推到 row 最右. */
  flex: 0 1 auto;
  text-align: center;
  font-size: 1.15rem;
  font-weight: bold;
  color: var(--it-text-primary);
  word-break: break-all;
}
.copy-btn {
  margin-left: 0;
  border-radius: 50%;
  padding: 4px;
  min-width: 28px;
  min-height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  background: var(--ep-fill-color-blank);
  border: none;
}
.copy-btn:hover {
  background: var(--ep-color-primary-light-9);
  color: var(--ep-color-primary);
}
@media (max-width: 600px) {
  /* .timestamp-page padding 已由全局 _tool-page.scss 提供 */
  .result-card {
    min-height: 80px;
  }
}
.date-picker-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}
</style>
