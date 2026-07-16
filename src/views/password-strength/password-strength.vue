<!-- 密码强度检测工具，本地分析密码强度和预估破解时间 -->

<template>
  <ToolPage
    class="password-strength-page"
    preset="medium-form"
    :title="t('tools.passwordStrength.name')"
    :subtitle="t('tools.passwordStrength.desc')"
  >

    <CardPane class="tool-input-card">
      <label class="field-label">{{ t('passwordStrengthPage.input.label') }}</label>
      <el-input
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        :placeholder="t('passwordStrengthPage.input.placeholder')"
        size="large"
        clearable
        autocomplete="off"
        :aria-label="t('passwordStrengthPage.input.label')"
      >
        <template #suffix>
          <el-button
            link
            :title="showPassword ? t('passwordStrengthPage.input.hide') : t('passwordStrengthPage.input.show')"
            @click="showPassword = !showPassword"
          >
            <el-icon><component :is="showPassword ? View : Hide" /></el-icon>
          </el-button>
        </template>
      </el-input>
    </CardPane>

    <CardPane v-if="password.length > 0" class="result-card">
      <!-- Strength meter -->
      <div class="meter">
        <div class="meter__bar">
          <div
            v-for="i in 5"
            :key="i"
            class="meter__segment"
            :class="{ 'meter__segment--on': i <= score + 1 }"
            :style="i <= score + 1 ? { background: meterColor } : {}"
          />
        </div>
        <div class="meter__label" :style="{ color: meterColor }">
          {{ t(`passwordStrengthPage.score.level.${score}`) }}
        </div>
      </div>

      <!-- Stats grid -->
      <el-row :gutter="16" class="pwd-stat-row">
        <el-col :xs="12" :sm="6">
          <div class="pwd-stat">
            <div class="pwd-stat__label">{{ t('passwordStrengthPage.stats.length') }}</div>
            <div class="pwd-stat__value">
              {{ stats.length }}
              <span class="pwd-stat__unit">/ 12+</span>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="pwd-stat">
            <div class="pwd-stat__label">{{ t('passwordStrengthPage.stats.entropy') }}</div>
            <div class="pwd-stat__value">
              {{ stats.entropy.toFixed(1) }}
              <span class="pwd-stat__unit">bits</span>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="pwd-stat">
            <div class="pwd-stat__label">{{ t('passwordStrengthPage.stats.crackTime') }}</div>
            <div class="pwd-stat__value stat__value--small">{{ crackTime }}</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="pwd-stat">
            <div class="pwd-stat__label">{{ t('passwordStrengthPage.stats.charset') }}</div>
            <div class="pwd-stat__value stat__value--small">{{ charsetSummary }}</div>
          </div>
        </el-col>
      </el-row>

      <div class="tool-divider" />

      <!-- Feedback checklist -->
      <div class="feedback">
        <div
          v-for="r in rules"
          :key="r.key"
          class="feedback__row"
          :class="r.pass ? 'feedback__row--pass' : 'feedback__row--fail'"
        >
          <el-icon class="feedback__icon">
            <component :is="r.pass ? CircleCheckFilled : CircleCloseFilled" />
          </el-icon>
          <span>{{ r.label }}</span>
        </div>
      </div>
    </CardPane>

    <EmptyState v-else margin-top="24px">
      {{ t('passwordStrengthPage.empty') }}
    </EmptyState>
  </ToolPage>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  CircleCheckFilled,
  CircleCloseFilled,
  Hide,
  View,
} from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n({ useScope: 'global' })

const password = ref('')
const showPassword = ref(false)

const COMMON_PASSWORDS = computed(() => {
  void locale.value
  return new Set([
    'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', '1234567',
    'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
    'ashley', 'bailey', 'shadow', '123123', '654321', 'superman', 'qazwsx',
    'michael', 'football', 'password1', 'password123', 'welcome', 'hello',
    'charlie', 'donald', 'admin', 'root', 'toor', 'passw0rd', 'p@ssw0rd',
    'p@ssword', 'pa55word', 'access', 'love', 'sex', 'god', 'secret',
    'test', 'test123', 'guest', 'master123', 'login', 'princess', 'qwerty123',
    'solo', 'passwd', 'starwars', '121212', '111111', '000000', '666666',
    '888888', 'abcdef', '123qwe', 'qwe123', 'zxcvbn', 'qwer1234', 'asdfgh',
    'asdf1234', 'qweasd', '1q2w3e', 'q1w2e3', 'q1w2e3r4', 'p@ss', 'changeme',
    'admin123', 'root123', '123456a', 'a123456', '5201314', 'woaini', 'aini',
    'iloveyou123', 'woaini1314', '1314520', '520520', 'qwertyu', 'asdfasdf',
    '1qaz2wsx', 'zaq12wsx', '!@#$%^&*', 'asd123', 'zxcvbnm', 'qweqwe',
    'aa123456', 'abc123456', '123456abc', '1q2w3e4r', 'aaaaaa', 'aabbcc',
    '112233', 'a12345', 'q123456', 'abcd1234', 'qq123456', 'abc@123',
  ])
})

function hasSequential(pwd: string): boolean {
  for (let i = 0; i + 2 < pwd.length; i++) {
    const a = pwd.charCodeAt(i), b = pwd.charCodeAt(i + 1), c = pwd.charCodeAt(i + 2)
    if ((b - a === 1 && c - b === 1) || (a - b === 1 && b - c === 1)) return true
  }
  return false
}

function hasRepeated(pwd: string): boolean {
  return /(.)\1{2,}/.test(pwd)
}

function detectCharsets(pwd: string) {
  return {
    lower:  /[a-z]/.test(pwd),
    upper:  /[A-Z]/.test(pwd),
    digit:  /\d/.test(pwd),
    symbol: /[^a-zA-Z0-9]/.test(pwd),
  }
}

// =============== Scoring ===============

interface Stats {
  length: number
  entropy: number
  charsetBits: number
  charsetCount: number
  hasLower: boolean
  hasUpper: boolean
  hasDigit: boolean
  hasSymbol: boolean
  isCommon: boolean
  isSequential: boolean
  isRepeated: boolean
}

const stats = computed<Stats>(() => {
  const pwd = password.value
  const cs = detectCharsets(pwd)
  let charsetSize = 0
  if (cs.lower)  charsetSize += 26
  if (cs.upper)  charsetSize += 26
  if (cs.digit)  charsetSize += 10
  if (cs.symbol) charsetSize += 33
  const entropy = charsetSize > 0 ? pwd.length * Math.log2(charsetSize) : 0
  return {
    length: pwd.length,
    entropy,
    charsetBits: charsetSize,
    charsetCount: Object.values(cs).filter(Boolean).length,
    hasLower:  cs.lower,
    hasUpper:  cs.upper,
    hasDigit:  cs.digit,
    hasSymbol: cs.symbol,
    isCommon:     COMMON_PASSWORDS.value.has(pwd.toLowerCase()),
    isSequential: hasSequential(pwd),
    isRepeated:   hasRepeated(pwd),
  }
})

const score = computed(() => {
  const s = stats.value
  let raw = 0
  if (s.length >= 8)  raw++
  if (s.length >= 12) raw++
  if (s.hasLower && s.hasUpper) raw++
  if (s.hasDigit) raw++
  if (s.hasSymbol) raw++
  // Patterns drag the score down — but always leave at least 0.
  if (s.isCommon)     raw = Math.min(raw, 0)
  if (s.isRepeated)   raw = Math.min(raw, 1)
  if (s.isSequential) raw = Math.min(raw, 2)
  // Map 0-5 → 0-4.
  return Math.min(4, Math.max(0, Math.round(raw * 4 / 5)))
})

const meterColor = computed(() => {
  // EP 主题色: 0-1 偏红, 2 黄, 3-4 偏绿; 用 light-5 拿中间色阶, dark 模式自动适配
  return [
    'var(--ep-color-danger)',
    'var(--ep-color-danger-light-5)',
    'var(--ep-color-warning)',
    'var(--ep-color-success-light-5)',
    'var(--ep-color-success)',
  ][score.value]
})

const crackTime = computed(() => {
  const guesses = Math.pow(2, stats.value.entropy)
  const seconds = guesses / 1e10
  if (seconds < 1)     return t('passwordStrengthPage.crackTime.instant')
  if (seconds < 60)    return `${seconds.toFixed(0)} ${t('passwordStrengthPage.crackTime.seconds')}`
  if (seconds < 3600)  return `${(seconds / 60).toFixed(0)} ${t('passwordStrengthPage.crackTime.minutes')}`
  if (seconds < 86400) return `${(seconds / 3600).toFixed(0)} ${t('passwordStrengthPage.crackTime.hours')}`
  if (seconds < 2592000) return `${(seconds / 86400).toFixed(0)} ${t('passwordStrengthPage.crackTime.days')}`
  if (seconds < 31536000) return `${(seconds / 2592000).toFixed(0)} ${t('passwordStrengthPage.crackTime.months')}`
  const years = seconds / 31536000
  if (years < 100) return `${years.toFixed(0)} ${t('passwordStrengthPage.crackTime.years')}`
  return t('passwordStrengthPage.crackTime.centuries')
})

const charsetSummary = computed(() => {
  const s = stats.value
  if (s.charsetCount === 0) return '—'
  return `${s.charsetCount} / 4`
})

// =============== Feedback checklist ===============

interface Rule { key: string; label: string; pass: boolean }

const rules = computed<Rule[]>(() => {
  const s = stats.value
  void locale.value
  return [
    { key: 'length',      label: t('passwordStrengthPage.feedback.rules.length'),      pass: s.length >= 8 },
    { key: 'lengthStrong', label: t('passwordStrengthPage.feedback.rules.lengthStrong'), pass: s.length >= 12 },
    { key: 'lower',       label: t('passwordStrengthPage.feedback.rules.lower'),        pass: s.hasLower },
    { key: 'upper',       label: t('passwordStrengthPage.feedback.rules.upper'),        pass: s.hasUpper },
    { key: 'digit',       label: t('passwordStrengthPage.feedback.rules.digit'),        pass: s.hasDigit },
    { key: 'symbol',      label: t('passwordStrengthPage.feedback.rules.symbol'),       pass: s.hasSymbol },
    { key: 'noCommon',    label: t('passwordStrengthPage.feedback.rules.noCommon'),     pass: !s.isCommon },
    { key: 'noRepeat',    label: t('passwordStrengthPage.feedback.rules.noRepeat'),     pass: !s.isRepeated },
    { key: 'noSequential', label: t('passwordStrengthPage.feedback.rules.noSequential'), pass: !s.isSequential },
  ]
})
</script>

<style lang="scss" scoped>
.meter {
  margin-bottom: 24px;
}
.meter__bar {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}
.meter__segment {
  flex: 1;
  height: 10px;
  border-radius: 2px;
  background-color: var(--it-border);
  transition: background-color var(--it-transition-smooth);
}
.meter__label {
  font-size: 16px;
  font-weight: 600;
  text-align: right;
  transition: color var(--it-transition-smooth);
}

.pwd-stat-row {
  margin-top: 4px;
}
.pwd-stat {
  padding: 8px 0;
}
.pwd-stat__label {
  font-size: 12px;
  color: var(--it-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 4px;
}
.pwd-stat__value {
  font-size: 20px;
  font-weight: 600;
  color: var(--it-text-primary);
  font-variant-numeric: tabular-nums;
}
.pwd-stat__value--small {
  font-size: 16px;
  font-weight: 500;
}
.pwd-stat__unit {
  font-size: 12px;
  font-weight: 400;
  color: var(--it-text-tertiary);
  margin-left: 2px;
}

.feedback {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.feedback__row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--it-text-primary);
}
.feedback__row--pass .feedback__icon {
  color: var(--ep-color-success);
}
.feedback__row--fail .feedback__icon {
  color: var(--ep-color-danger);
}

@media (max-width: 600px) {
  .pwd-stat__value { font-size: 18px; }
}
</style>
