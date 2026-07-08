<!-- 阴阳历日历，支持节日和节气显示 -->

<template>
  <ToolPage
    class="calendar-page"
    preset="large-form"
    :title="t('tools.calendar.name')"
    :subtitle="t('tools.calendar.desc')"
  >

    <CardPane class="calendar-card" body-padding="0">
      <el-calendar>
        <template #date-cell="{ data }">
          <div>
            <div class="solar">{{ data.day.split('-')[2] }}</div>
            <div
              class="lunar"
              :class="{ festival: isFestival(data) }"
            >
              {{ solarToLunar(data) }}
            </div>
          </div>
        </template>
      </el-calendar>
    </CardPane>
  </ToolPage>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import calendar from '~/utils/js-calendar-converter.js'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')

const { t } = useI18n({ useScope: 'global' })

// 判断是否是节日（不含节气）
function isFestival(slotData: { day: string }) {
  const [y, m, d] = slotData.day.split('-')
  const lunarDay = calendar.solar2lunar(y, m, d)

  const festAndTerm =
    (lunarDay.festival == null ? '' : ' ' + lunarDay.festival) +
    (lunarDay.lunarFestival == null ? '' : '' + lunarDay.lunarFestival)

  return festAndTerm != ''
}

// 公历转农历，优先显示节日或节气
function solarToLunar(slotData: { day: string }) {
  const [y, m, d] = slotData.day.split('-')
  const lunarDay = calendar.solar2lunar(y, m, d)

  const lunarMD = lunarDay.IDayCn == '初一' ? lunarDay.IMonthCn : lunarDay.IDayCn

  const festAndTerm =
    (lunarDay.festival == null ? '' : ' ' + lunarDay.festival) +
    (lunarDay.lunarFestival == null ? '' : ' ' + lunarDay.lunarFestival) +
    (lunarDay.Term == null ? '' : ' ' + lunarDay.Term)

  return festAndTerm == '' ? lunarMD : festAndTerm
}
</script>

<style lang="scss" scoped>
/* 单元格布局：公历在上，农历在下 */
.solar {
  font-size: 14px;
  line-height: 1.2;
  color: var(--it-text-primary);
}
.lunar {
  font-size: 12px;
  line-height: 1.2;
  color: var(--it-text-secondary);
}
.lunar.festival {
  color: var(--el-color-danger);
}

/* Element Plus 内部样式覆盖 */
:deep(.ep-calendar-day) {
  display: flex;
  justify-content: space-around;
  align-content: center;
  flex-wrap: wrap;
}

:deep(.ep-calendar-table .current .lunar.festival) {
  color: var(--el-color-danger);
}
:deep(.ep-calendar__body) {
  padding: 0;
}
:deep(.ep-calendar-table .current:nth-last-child(-n+2)) {
  background: var(--ep-fill-color-light);
}
:deep(.ep-button-group) {
  display: flex;
}
</style>
