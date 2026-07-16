<!-- 计时器工具，包含秒表和倒计时两种模式 -->
<template>
  <ToolPage
    class="timer-page"
    preset="medium-form"
    :title="t('tools.timer.name')"
    :subtitle="t('tools.timer.desc')"
  >
    <div class="tab-bar" role="tablist">
      <button
        class="tab-bar__item"
        :class="{ 'tab-bar__item--active': mode === 'stopwatch' }"
        role="tab"
        :aria-selected="mode === 'stopwatch'"
        @click="setMode('stopwatch')"
      >
        {{ t('timerPage.tab.stopwatch') }}
      </button>
      <button
        class="tab-bar__item"
        :class="{ 'tab-bar__item--active': mode === 'countdown' }"
        role="tab"
        :aria-selected="mode === 'countdown'"
        @click="setMode('countdown')"
      >
        {{ t('timerPage.tab.countdown') }}
      </button>
    </div>

    <!-- =================== Stopwatch =================== -->
    <CardPane v-if="mode === 'stopwatch'" class="t-card">
      <div class="t-display">
        <span class="t-display__time">{{ formatElapsed(sw.elapsedMs) }}</span>
        <span class="t-display__unit">{{ t('timerPage.unit.cs') }}</span>
      </div>

      <div class="tool-actions">
        <el-button v-if="!sw.running" type="primary" size="large" @click="swStart">
          {{ t('timerPage.action.start') }}
        </el-button>
        <el-button v-else type="warning" size="large" @click="swPause">
          {{ t('timerPage.action.pause') }}
        </el-button>
        <el-button size="large" @click="swReset" :disabled="!sw.running && sw.elapsedMs === 0 && sw.laps.length === 0">
          {{ t('timerPage.action.reset') }}
        </el-button>
        <el-button v-if="sw.running" size="large" @click="swLap">
          {{ t('timerPage.action.lap') }}
        </el-button>
      </div>

      <div v-if="sw.laps.length" class="t-laps">
        <div class="t-lap-row t-lap-row--head">
          <span>#</span>
          <span>{{ t('timerPage.lap.lapTime') }}</span>
          <span>{{ t('timerPage.lap.totalTime') }}</span>
        </div>
        <div v-for="lap in sw.laps" :key="lap.index" class="t-lap-row">
          <span>{{ lap.index }}</span>
          <span class="t-mono">{{ formatElapsed(lap.lapMs) }}</span>
          <span class="t-mono">{{ formatElapsed(lap.totalMs) }}</span>
        </div>
      </div>
    </CardPane>

    <!-- =================== Countdown =================== -->
    <CardPane v-else class="t-card">
      <template v-if="cd.phase === 'idle' || cd.phase === 'paused'">
        <div class="t-presets">
          <button
            v-for="p in presets"
            :key="p.h + ':' + p.m + ':' + p.s"
            class="t-preset"
            :class="{ 't-preset--active': cd.hours === p.h && cd.minutes === p.m && cd.seconds === p.s }"
            @click="applyPreset(p)"
          >
            {{ p.label }}
          </button>
        </div>

        <div class="t-custom">
          <div class="t-num-field">
            <el-input-number v-model="cd.hours" :min="0" :max="23" controls-position="right" />
            <span class="t-num-label">{{ t('timerPage.unit.hour') }}</span>
          </div>
          <div class="t-num-field">
            <el-input-number v-model="cd.minutes" :min="0" :max="59" controls-position="right" />
            <span class="t-num-label">{{ t('timerPage.unit.minute') }}</span>
          </div>
          <div class="t-num-field">
            <el-input-number v-model="cd.seconds" :min="0" :max="59" controls-position="right" />
            <span class="t-num-label">{{ t('timerPage.unit.second') }}</span>
          </div>
        </div>
      </template>

      <div class="t-display">
        <span
          class="t-display__time"
          :class="{
            't-display__time--warn': cd.phase === 'running' && cd.remainingMs <= 10_000 && cd.remainingMs > 0,
            't-display__time--alert': cd.phase === 'finished',
          }"
        >{{ formatRemaining(cd.remainingMs) }}</span>
      </div>

      <div class="tool-actions">
        <el-button v-if="cd.phase === 'idle'" type="primary" size="large" @click="cdStart" :disabled="totalSeconds() === 0">
          {{ t('timerPage.action.start') }}
        </el-button>
        <el-button v-if="cd.phase === 'running'" type="warning" size="large" @click="cdPause">
          {{ t('timerPage.action.pause') }}
        </el-button>
        <el-button v-if="cd.phase === 'paused'" type="primary" size="large" @click="cdStart">
          {{ t('timerPage.action.resume') }}
        </el-button>
        <el-button v-if="cd.phase !== 'idle'" size="large" @click="cdReset">
          {{ t('timerPage.action.reset') }}
        </el-button>
      </div>
    </CardPane>
  </ToolPage>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { pad } from '~/utils/datetime'

type Mode = 'stopwatch' | 'countdown'
type CountdownPhase = 'idle' | 'running' | 'paused' | 'finished'

const { t, locale } = useI18n({ useScope: 'global' })

const mode = ref<Mode>('stopwatch')

// =================== Stopwatch state ===================

interface Lap {
  index: number
  lapMs: number
  totalMs: number
}

const sw = reactive({
  elapsedMs: 0,
  running: false,
  startedAt: 0,
  baseElapsedMs: 0,
  laps: [] as Lap[],
  rafId: 0,
})

function swTick() {
  sw.elapsedMs = sw.baseElapsedMs + (performance.now() - sw.startedAt)
  sw.rafId = requestAnimationFrame(swTick)
}

function swStart() {
  if (sw.running) return
  sw.startedAt = performance.now()
  sw.running = true
  sw.rafId = requestAnimationFrame(swTick)
}

function swPause() {
  if (!sw.running) return
  cancelAnimationFrame(sw.rafId)
  sw.baseElapsedMs = sw.elapsedMs
  sw.running = false
}

function swReset() {
  cancelAnimationFrame(sw.rafId)
  sw.running = false
  sw.elapsedMs = 0
  sw.baseElapsedMs = 0
  sw.laps = []
}

function swLap() {
  const lastTotal = sw.laps.length ? sw.laps[sw.laps.length - 1].totalMs : 0
  const total = sw.elapsedMs
  sw.laps.push({
    index: sw.laps.length + 1,
    lapMs: total - lastTotal,
    totalMs: total,
  })
}

// =================== Countdown state ===================

const cd = reactive({
  hours: 0,
  minutes: 5,
  seconds: 0,
  remainingMs: 5 * 60 * 1000,
  phase: 'idle' as CountdownPhase,
  startedAt: 0,
  baseRemainingMs: 5 * 60 * 1000,
  rafId: 0,
})

const presets = computed(() => {
  void locale.value
  return [
    { label: t('timerPage.preset.1min'),  h: 0, m: 1,  s: 0 },
    { label: t('timerPage.preset.3min'),  h: 0, m: 3,  s: 0 },
    { label: t('timerPage.preset.5min'),  h: 0, m: 5,  s: 0 },
    { label: t('timerPage.preset.10min'), h: 0, m: 10, s: 0 },
    { label: t('timerPage.preset.15min'), h: 0, m: 15, s: 0 },
    { label: t('timerPage.preset.30min'), h: 0, m: 30, s: 0 },
    { label: t('timerPage.preset.60min'), h: 1, m: 0,  s: 0 },
  ]
})

function totalSeconds() {
  return cd.hours * 3600 + cd.minutes * 60 + cd.seconds
}

function applyPreset(p: { h: number; m: number; s: number }) {
  cd.hours = p.h
  cd.minutes = p.m
  cd.seconds = p.s
  cd.remainingMs = totalSeconds() * 1000
}

function cdTick() {
  const remaining = cd.baseRemainingMs - (performance.now() - cd.startedAt)
  cd.remainingMs = Math.max(0, remaining)
  if (remaining <= 0) {
    cancelAnimationFrame(cd.rafId)
    cd.phase = 'finished'
    onCountdownDone()
    return
  }
  cd.rafId = requestAnimationFrame(cdTick)
}

function cdStart() {
  if (cd.phase === 'running') return
  if (cd.phase === 'idle') {
    const total = totalSeconds() * 1000
    if (total <= 0) return
    cd.baseRemainingMs = total
    cd.remainingMs = total
  }
  cd.startedAt = performance.now()
  cd.phase = 'running'
  cd.rafId = requestAnimationFrame(cdTick)
}

function cdPause() {
  if (cd.phase !== 'running') return
  cancelAnimationFrame(cd.rafId)
  cd.baseRemainingMs = cd.remainingMs
  cd.phase = 'paused'
}

function cdReset() {
  cancelAnimationFrame(cd.rafId)
  cd.phase = 'idle'
  cd.remainingMs = totalSeconds() * 1000
  cd.baseRemainingMs = cd.remainingMs
}

function onCountdownDone() {
  beep()
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    try {
      new Notification(t('tools.timer.name'), {
        body: t('timerPage.notify.done'),
        silent: false,
      })
    } catch { /* some browsers throw even on permission check; ignore */ }
  }
  ElMessage.success(t('timerPage.notify.done'))
}

// WebAudio 蜂鸣提示，延迟创建避免 SSR 错误
let audioCtx: AudioContext | null = null
function beep() {
  try {
    const Ctor = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)
    if (!Ctor) return
    audioCtx ??= new Ctor()
    const ctx = audioCtx
    const t0 = ctx.currentTime
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = 880
      const start = t0 + i * 0.28
      const stop = start + 0.16
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.28, start + 0.02)
      gain.gain.linearRampToValueAtTime(0, stop)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(stop + 0.01)
    }
  } catch { /* audio not available; visual cue (pulse) still fires */ }
}

// 将毫秒分解为时分秒毫秒
function parts(ms: number, ceil = false) {
  const totalCs = ceil ? Math.ceil(ms / 10) : Math.floor(ms / 10)
  const cs = totalCs % 100
  const totalSec = Math.floor(totalCs / 100)
  const s = totalSec % 60
  const totalMin = Math.floor(totalSec / 60)
  return {
    h: Math.floor(totalMin / 60),
    m: totalMin % 60,
    s,
    cs,
  }
}

function formatElapsed(ms: number) {
  const { h, m, s, cs } = parts(ms)
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`
}

function formatRemaining(ms: number) {
  const { h, m, s } = parts(ms, true)
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

function setMode(m: Mode) {
  if (mode.value === m) return
  mode.value = m
  if (sw.running) swPause()
  if (cd.phase === 'running') cdPause()
}

onBeforeUnmount(() => {
  cancelAnimationFrame(sw.rafId)
  cancelAnimationFrame(cd.rafId)
})
</script>

<style lang="scss" scoped>
.t-card {
  max-width: 600px;
  margin: 0 auto;
}

/* Preset chips */
.t-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 20px;
}
.t-preset {
  background: var(--it-bg-elevated);
  border: 1px solid var(--it-border);
  color: var(--it-text-primary);
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  cursor: pointer;
  transition: border-color var(--it-transition), color var(--it-transition), background-color var(--it-transition);
}
.t-preset:hover {
  border-color: var(--brand-primary);
  color: var(--brand-primary);
}
.t-preset--active {
  background: var(--brand-primary-soft);
  border-color: var(--brand-primary);
  color: var(--brand-primary);
  font-weight: 600;
}

/* Custom-time row */
.t-custom {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.t-num-field {
  display: flex;
  align-items: center;
  gap: 4px;
}
.t-num-field :deep(.ep-input-number) {
  width: 100px;
}
.t-num-label {
  color: var(--it-text-secondary);
  font-size: 13px;
}

/* Big monospace display. font-variant-numeric: tabular-nums so the
   digit widths don't jiggle as the time changes — critical for a
   readable timer. */
.t-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  margin: 24px 0 28px;
}
.t-display__time {
  font-family: var(--font-mono);
  font-size: 64px;
  font-weight: 300;
  color: var(--it-text-primary);
  letter-spacing: 2px;
  font-variant-numeric: tabular-nums;
  transition: color var(--it-transition);
}
.t-display__time--warn {
  color: var(--ep-color-warning);
}
.t-display__time--alert {
  color: var(--ep-color-danger);
  animation: t-pulse 1s ease-in-out infinite;
}
.t-display__unit {
  font-size: 14px;
  color: var(--it-text-tertiary);
  align-self: flex-end;
  padding-bottom: 8px;
}
@keyframes t-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.45; }
}

/* Lap table */
.t-laps {
  margin-top: 28px;
  border-top: 1px solid var(--it-border);
  padding-top: 12px;
  max-height: 280px;
  overflow-y: auto;
}
.t-lap-row {
  display: grid;
  grid-template-columns: 40px 1fr 1fr;
  gap: 12px;
  padding: 6px 8px;
  font-size: 13px;
  color: var(--it-text-primary);
  border-radius: 4px;
}
/* Zebra stripe */
.t-lap-row:nth-child(even):not(.t-lap-row--head) {
  background-color: var(--brand-primary-soft);
}
.t-lap-row--head {
  font-weight: 600;
  color: var(--it-text-secondary);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding-bottom: 8px;
}
.t-mono {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

/* Mobile */
@media (max-width: 600px) {
  /* .timer-page padding + .title font-size 已由全局 _tool-page.scss 提供 */
  /* .t-card 移动端 padding 20 16 已由 <CardPane bodyMobilePadding="20px 16px"> 提供 */
  .t-display__time { font-size: 44px; letter-spacing: 1px; }
  /* 移动端 tab 紧凑 — .tab-bar__item 是全局 utility, 但作为
     timer.vue template 内元素本身带 [data-v-xxx], 普通 scoped
     选择器就能命中, 不需要 :deep()。 */
  .tab-bar__item { padding: 8px 16px; font-size: 14px; }
  .t-lap-row { grid-template-columns: 28px 1fr 1fr; gap: 8px; font-size: 12px; }
  .t-num-field :deep(.ep-input-number) { width: 80px; }
}
</style>
