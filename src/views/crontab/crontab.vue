<!-- Cron 表达式生成器/解析器，支持中英文描述 -->

<template>
  <ToolPage
    class="crontab-page"
    preset="large-form"
    :title="t('tools.crontab.name')"
    :subtitle="t('tools.crontab.desc')"
  >

    <div class="tool-grid--narrow-left tool-grid--narrow-left-start">
      <!-- 左侧：输入 + 描述 + 开关 -->
      <CardPane class="crontab-card">
        <div class="crontab-card__input-wrap">
          <input
            v-model="cron"
            class="crontab-input"
            :class="{ 'crontab-input--error': !validation.isValid }"
            :placeholder="t('crontabPage.placeholder')"
            spellcheck="false"
            autocomplete="off"
            autocapitalize="off"
            autocorrect="off"
          >
        </div>

        <div class="crontab-card__cron-string">{{ cronString }}</div>

        <div v-if="!validation.isValid" class="crontab-card__feedback">
          {{ validation.message }}
        </div>

        <div class="tool-divider" />

        <div class="crontab-card__form">
          <div class="tool-form-row crontab-form-row">
            <label class="field-label field-label--inline-wide">{{ t('crontabPage.options.verbose') }}</label>
            <el-switch v-model="cronstrueConfig.verbose" />
          </div>
          <div class="tool-form-row crontab-form-row">
            <label class="field-label field-label--inline-wide">{{ t('crontabPage.options.hour24') }}</label>
            <el-switch v-model="cronstrueConfig.use24HourTimeFormat" />
          </div>
          <div class="tool-form-row crontab-form-row">
            <label class="field-label field-label--inline-wide">{{ t('crontabPage.options.daysStartAt0') }}</label>
            <el-switch v-model="cronstrueConfig.dayOfWeekStartIndexZero" />
          </div>
        </div>
      </CardPane>

      <!-- 右侧：示意图 + 符号表 -->
      <CardPane class="crontab-card">
        <pre class="crontab-card__diagram">{{ diagramText }}</pre>

        <div class="tool-divider" />

        <!-- Desktop / tablet: 4-col table -->
        <div v-if="!isSmallScreen" class="crontab-table-wrap">
          <table class="crontab-table" :aria-label="t('crontabPage.symbolTableLabel')">
            <thead>
              <tr>
                <th>{{ t('crontabPage.symbol.symbol') }}</th>
                <th>{{ t('crontabPage.symbol.meaning') }}</th>
                <th>{{ t('crontabPage.symbol.example') }}</th>
                <th>{{ t('crontabPage.symbol.equivalent') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in helpers" :key="row.symbol">
                <td><strong>{{ row.symbol }}</strong></td>
                <td>{{ row.meaning }}</td>
                <td><code class="tool-chip">{{ row.example }}</code></td>
                <td>{{ row.equivalent }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile: each row becomes a stacked card -->
        <div v-else class="crontab-card-list">
          <div v-for="row in helpers" :key="row.symbol" class="crontab-card-list__item">
            <div>{{ t('crontabPage.symbol.symbol') }}: <strong>{{ row.symbol }}</strong></div>
            <div>{{ t('crontabPage.symbol.meaning') }}: <strong>{{ row.meaning }}</strong></div>
            <div>
              {{ t('crontabPage.symbol.example') }}:
              <strong><code class="tool-chip">{{ row.example }}</code></strong>
            </div>
            <div>{{ t('crontabPage.symbol.equivalent') }}: <strong>{{ row.equivalent }}</strong></div>
          </div>
        </div>
      </CardPane>
    </div>
  </ToolPage>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import cronstrue from 'cronstrue'
import { toString as cronstrueI18n } from 'cronstrue/i18n'
import { isValidCron } from 'cron-validator'
import { useT } from '~/composables/useT'

const { t, locale } = useT()

const cron = ref('40 * * * *')
const cronstrueConfig = reactive({
  verbose: true,
  use24HourTimeFormat: true,
  dayOfWeekStartIndexZero: true,
})

const isSmallScreen = useMediaQuery('(max-width: 600px)')

const isCronValid = (v: string) => isValidCron(v, {
  allowBlankDay: true,
  alias: true,
  seconds: true,
})

const validation = computed<{ isValid: boolean; message: string }>(() => {
  const value = cron.value.trim()
  if (!value) return { isValid: false, message: t('crontabPage.error.empty') }
  if (!isCronValid(value)) return { isValid: false, message: t('crontabPage.error.invalid') }
  return { isValid: true, message: '' }
})

const cronString = computed(() => {
  if (!validation.value.isValid) return ' '
  try {
    const opts = { ...cronstrueConfig, throwExceptionOnParseError: true }
    return locale.value === 'zh-CN'
      ? cronstrueI18n(cron.value, { ...opts, locale: 'zh_CN' })
      : cronstrue.toString(cron.value, opts)
  } catch {
    return ' '
  }
})

const helpers = computed(() => [
  { symbol: '*',     meaning: t('crontabPage.symbol.anyValue'),
    example: '* * * *',     equivalent: t('crontabPage.symbol.everyMinute') },
  { symbol: '-',     meaning: t('crontabPage.symbol.range'),
    example: '1-10 * * *',  equivalent: t('crontabPage.symbol.minutes1Through10') },
  { symbol: ',',     meaning: t('crontabPage.symbol.list'),
    example: '1,10 * * *',  equivalent: t('crontabPage.symbol.atMinutes1And10') },
  { symbol: '/',     meaning: t('crontabPage.symbol.step'),
    example: '*/10 * * *',  equivalent: t('crontabPage.symbol.every10Minutes') },
  { symbol: '@yearly',    meaning: t('crontabPage.symbol.yearly'),
    example: '@yearly',     equivalent: '0 0 1 1 *' },
  { symbol: '@annually',  meaning: t('crontabPage.symbol.annually'),
    example: '@annually',   equivalent: '0 0 1 1 *' },
  { symbol: '@monthly',   meaning: t('crontabPage.symbol.monthly'),
    example: '@monthly',    equivalent: '0 0 1 * *' },
  { symbol: '@weekly',    meaning: t('crontabPage.symbol.weekly'),
    example: '@weekly',     equivalent: '0 0 * * 0' },
  { symbol: '@daily',     meaning: t('crontabPage.symbol.daily'),
    example: '@daily',      equivalent: '0 0 * * *' },
  { symbol: '@midnight',  meaning: t('crontabPage.symbol.midnight'),
    example: '@midnight',   equivalent: '0 0 * * *' },
  { symbol: '@hourly',    meaning: t('crontabPage.symbol.hourly'),
    example: '@hourly',     equivalent: '0 * * * *' },
  { symbol: '@reboot',    meaning: t('crontabPage.symbol.reboot'),
    example: '',            equivalent: '' },
])

const diagramText = computed(() => {
  return [
    '\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 [' + t('crontabPage.diagram.optional') + '] ' + t('crontabPage.diagram.seconds') + ' (0 - 59)',
    '\u2502 \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 ' + t('crontabPage.diagram.minute') + ' (0 - 59)',
    '\u2502 \u2502 \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500 ' + t('crontabPage.diagram.hour') + ' (0 - 23)',
    '\u2502 \u2502 \u2502 \u250c\u2500\u2500\u2500\u2500\u2500\u2500 ' + t('crontabPage.diagram.dayOfMonth') + ' (1 - 31)',
    '\u2502 \u2502 \u2502 \u2502 \u250c\u2500\u2500\u2500\u2500 ' + t('crontabPage.diagram.month') + ' (1 - 12) ' + t('crontabPage.diagram.monthAlias'),
    '\u2502 \u2502 \u2502 \u2502 \u2502 \u250c\u2500\u2500 ' + t('crontabPage.diagram.dayOfWeek') + ' (0 - 6, ' + t('crontabPage.diagram.sunday') + ') ' + t('crontabPage.diagram.weekdayAlias'),
    '\u2502 \u2502 \u2502 \u2502 \u2502 \u2502',
    '* * * * * ' + t('crontabPage.diagram.command'),
  ].join('\n')
})
</script>

<style lang="scss" scoped>
.crontab-form-row {
  width: 100%;
  max-width: 400px;
}

@media (max-width: 600px) {
  .crontab-form-row { max-width: 100%; }
  .field-label--inline-wide { flex-basis: 130px; padding-right: 8px; }
}

.crontab-card__input-wrap {
  max-width: 384px;
  margin: 0 auto;
}

/* 大字体居中输入框 */
.crontab-input {
  width: 100%;
  font-size: 30px;
  font-family: var(--font-mono);
  padding: 5px;
  text-align: center;
  color: var(--it-text-primary);
  background-color: var(--it-bg-elevated);
  border: 1px solid var(--it-border);
  border-radius: 4px;
  outline: none;
  box-sizing: border-box;
  transition: border-color var(--it-transition), background-color var(--it-transition);
}
.crontab-input::placeholder {
  color: var(--it-text-tertiary);
}
.crontab-input:hover,
.crontab-input:focus {
  border-color: var(--brand-primary);
}
.crontab-input:focus {
  background-color: var(--brand-primary-soft);
}
.crontab-input--error,
.crontab-input--error:hover,
.crontab-input--error:focus {
  border-color: var(--ep-color-danger);
}
.crontab-input--error:focus {
  background-color: rgba(245, 108, 108, 0.13);
}

/* 描述文本 */
.crontab-card__cron-string {
  text-align: center;
  font-size: 22px;
  color: var(--it-text-primary);
  margin: 5px 0 15px;
  min-height: 33px;
  word-break: break-word;
}

.crontab-card__feedback {
  text-align: center;
  color: var(--ep-color-danger);
  font-size: 14px;
  margin-top: -8px;
  margin-bottom: 12px;
}

/* 表单行布局 */
.crontab-card__form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

/* ASCII 示意图 */
.crontab-card__diagram {
  overflow: auto;
  padding: 10px 0;
  margin: 0;
  font-family: var(--font-mono);
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--it-text-primary);
  white-space: pre;
}

/* 符号表格 */
.crontab-table-wrap {
  overflow-x: auto;
  border-radius: 4px;
}
.crontab-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 14px;
  color: var(--it-text-primary);
}
.crontab-table thead {
  background-color: var(--it-bg-elevated);
  color: var(--it-text-secondary);
  text-transform: uppercase;
}
.crontab-table thead th {
  padding: 12px 24px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--it-border);
}
.crontab-table tbody td {
  padding: 16px 24px;
  border-bottom: 1px solid var(--it-border);
  vertical-align: top;
}
.crontab-table tbody tr:last-child td {
  border-bottom: none;
}
/* 移动端堆叠卡片 */
.crontab-card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.crontab-card-list__item {
  border: 1px solid var(--it-border);
  border-radius: 4px;
  padding: 12px 16px;
  background-color: var(--it-bg-elevated);
  font-size: 13px;
  line-height: 1.8;
  color: var(--it-text-primary);
}

@media (max-width: 600px) {
  .crontab-input { font-size: 22px; }
  .crontab-card__cron-string { font-size: 18px; }
  .crontab-table thead th,
  .crontab-table tbody td { padding: 10px 14px; }
}
</style>
