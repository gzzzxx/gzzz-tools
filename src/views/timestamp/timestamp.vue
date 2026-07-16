<!-- 时间戳转换工具，支持日期和时间戳互转 -->

<template>
  <ToolPage
    class="timestamp-page"
    preset="medium-form"
    :title="t('tools.timestamp.name')"
    :subtitle="t('tools.timestamp.desc')"
  >
    <CardPane class="tool-input-card">
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
      <div class="input-row">
        <el-input
          v-model="timestamp"
          :placeholder="t('timestampPage.input.timestampPlaceholder')"
          @input="onTimestampInput"
          prefix-icon="el-icon-time"
          clearable
        />
        <el-input
          v-model="dateString"
          :placeholder="t('timestampPage.input.dateStringPlaceholder')"
          @input="onDateInput"
          prefix-icon="el-icon-date"
          clearable
        />
      </div>
    </CardPane>
    <div class="result-row">
      <CardPane class="result-card" variant="result" body-padding="0">
        <div class="result-label result-label--block">{{ t('timestampPage.result.date') }}</div>
        <div class="result-row-flex result-row-flex--center">
          <span class="result-value result-value--lg result-mono">{{ formattedDate }}</span>
          <CopyButton
            variant="icon"
            :text="formattedDate"
          />
        </div>
      </CardPane>
      <CardPane class="result-card" variant="result" body-padding="0">
        <div class="result-label result-label--block">{{ t('timestampPage.result.timestamp') }}</div>
        <div class="result-row-flex result-row-flex--center">
          <span class="result-value result-value--lg result-mono">{{ formattedTimestamp }}</span>
          <CopyButton
            variant="icon"
            :text="formattedTimestamp"
          />
        </div>
      </CardPane>
    </div>
  </ToolPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatDateTime } from '~/utils/datetime'

const { t } = useI18n({ useScope: 'global' })

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
</script>

<style lang="scss" scoped>
.input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: center;
}
.result-row {
  margin-top: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.result-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
@media (max-width: 600px) {
  .input-row,
  .result-row {
    grid-template-columns: 1fr;
  }
  .result-card {
    min-height: 80px;
  }
}
.date-picker-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}
// timestamp 专属: label 居中在结果卡顶部 (上面带 8px 留白)
.result-label--block {
  margin-top: 8px;
  align-self: center;
}
// timestamp 专属: 居中堆叠 value + 复制按钮
.result-row-flex--center {
  justify-content: center;
  flex-wrap: wrap;
  min-height: 38px;
  gap: 8px;
}
// timestamp 专属: 时间戳数字突出显示
.result-value--lg {
  font-size: 1.15rem;
  font-weight: 700;
  text-align: center;
}
</style>
