<!-- 文本统计工具，支持字符、单词、行数、段落、中日韩字符和阅读时间分析 -->

<template>
  <ToolPage
    class="text-stats-page"
    preset="large-form"
    :title="t('tools.textStats.name')"
    :subtitle="t('tools.textStats.desc')"
  >

    <CardPane class="tool-input-card">
      <el-input
        v-model="input"
        type="textarea"
        :rows="6"
        :placeholder="t('textStatsPage.input.placeholder')"
        resize="none"
        clearable
      />
      <div class="input-meta">
        <span>{{ t('textStatsPage.input.meta', { chars: stats.chars, bytes: stats.bytes }) }}</span>
        <el-button :icon="Delete" size="small" @click="input = ''">
          {{ t('textStatsPage.input.clear') }}
        </el-button>
      </div>
    </CardPane>

    <div class="stat-grid">
      <CardPane
        v-for="group in groups"
        :key="group.key"
        class="stat-card"
        variant="result"
      >
        <div class="stat-card__title">{{ t(`textStatsPage.group.${group.key}`) }}</div>
        <ul class="stat-card__list">
          <li v-for="key in group.items" :key="key" class="stat-card__item">
            <span class="stat-card__label">{{ t(`textStatsPage.label.${key}`) }}</span>
            <span class="stat-card__value result-mono">{{ formatStat(key, stats[key]) }}</span>
          </li>
        </ul>
      </CardPane>
    </div>

    <CardPane class="reading-card" variant="result">
      <div class="reading-row">
        <div class="reading-block">
          <div class="reading-block__label">{{ t('textStatsPage.reading.label') }}</div>
          <div class="reading-block__value">{{ formattedReadingTime }}</div>
        </div>
        <div class="reading-block">
          <div class="reading-block__label">{{ t('textStatsPage.reading.cpm') }}</div>
          <div class="reading-block__value reading-block__value--small">
            CJK ≈ 400 / min · EN ≈ 250 wpm
          </div>
        </div>
      </div>
    </CardPane>
  </ToolPage>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })
const input = ref('')

// All keys the template is allowed to read off `stats`. The
// presentation groups below are typed against this so a typo in
// `items: ['charss', ...]` is a compile error.
type StatKey =
  | 'chars' | 'charsNoSpace' | 'bytes'
  | 'lines' | 'nonEmptyLines' | 'paragraphs'
  | 'words' | 'sentences'
  | 'cjk' | 'ascii'
  | 'digits' | 'punctuation' | 'spaces' | 'others'
  | 'readingMs'
  | 'avgSentenceLength' | 'avgWordLength'
  | 'longestLine' | 'avgLinesPerParagraph'

interface Stat { [K in StatKey]: number }

const groups: Array<{ key: string; items: StatKey[] }> = [
  { key: 'basic',       items: ['chars', 'charsNoSpace', 'bytes', 'lines', 'nonEmptyLines', 'paragraphs'] },
  { key: 'composition', items: ['cjk', 'ascii', 'digits', 'punctuation', 'spaces', 'others'] },
  { key: 'reading',     items: ['words', 'sentences', 'avgSentenceLength', 'avgWordLength', 'longestLine', 'avgLinesPerParagraph'] },
]

const stats = computed<Stat>(() => analyze(input.value))

// 派生指标里两个是小数, 模板里 toFixed(1); 其余整数直显
const FLOAT_KEYS: ReadonlySet<StatKey> = new Set(['avgWordLength', 'avgLinesPerParagraph'])
function formatStat(key: StatKey, value: number): string {
  return FLOAT_KEYS.has(key) ? value.toFixed(1) : String(value)
}

const formattedReadingTime = computed(() => {
  const ms = stats.value.readingMs
  if (ms <= 0) return t('textStatsPage.reading.empty')
  const total = Math.round(ms / 1000)
  if (total < 60) return t('textStatsPage.reading.seconds', { n: total })
  const m = Math.floor(total / 60)
  const s = total % 60
  return s === 0
    ? t('textStatsPage.reading.minutesOnly', { n: m })
    : t('textStatsPage.reading.minutes', { n: m, s })
})

const CJK_RE = /[\u3400-\u9fff\uF900-\uFAFF]/
// 覆盖 ASCII 空白 + 全角空格 (U+3000, IME 输入常见) + NBSP (U+00A0, 复制粘贴常见)
const WHITESPACE_RE = /[\s\u3000\u00A0]/
const SENTENCE_END_RE = /[.!?。！？…]+/
const PUNCTUATION_RE = /[.,;:!?。，；：！？、…—"'()\[\]{}<>«»`~@#\$%\^&*_+\-=/\\|]/

const isWordContent = (s: string): boolean => {
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (CJK_RE.test(c)) return true
    if (c >= '0' && c <= '9') return true
    if (c >= 'A' && c <= 'Z') return true
    if (c >= 'a' && c <= 'z') return true
  }
  return false
}

function countWords(text: string): number {
  if (!text) return 0
  let words = 0, buf = ''
  const flush = () => {
    if (buf && isWordContent(buf)) {
      words += buf.trim().split(/\s+/).filter(Boolean).length
    }
    buf = ''
  }
  for (const ch of text) {
    if (CJK_RE.test(ch)) { flush(); words++; continue }
    if (WHITESPACE_RE.test(ch)) { flush(); continue }
    buf += ch
  }
  flush()
  return words
}

function countSentences(text: string): number {
  if (!text.trim()) return 0
  return text.trim().split(SENTENCE_END_RE).filter(p => p.trim()).length
}

const ZERO_STATS: Stat = {
  chars: 0, charsNoSpace: 0, bytes: 0,
  lines: 0, nonEmptyLines: 0, paragraphs: 0,
  words: 0, sentences: 0,
  cjk: 0, ascii: 0,
  digits: 0, punctuation: 0, spaces: 0, others: 0,
  readingMs: 0,
  avgSentenceLength: 0, avgWordLength: 0,
  longestLine: 0, avgLinesPerParagraph: 0,
}

function analyze(text: string): Stat {
  if (!text) return { ...ZERO_STATS }

  let charsNoSpace = 0, cjk = 0, ascii = 0, digits = 0
  let punctuation = 0, spaces = 0, others = 0

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (WHITESPACE_RE.test(ch)) { spaces++; continue }
    charsNoSpace++
    if (CJK_RE.test(ch)) cjk++
    else if (ch >= '0' && ch <= '9') { digits++ }
    else if ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z')) ascii++
    else if (PUNCTUATION_RE.test(ch)) punctuation++
    else others++
  }

  const rawLines = text.split(/\r\n|\r|\n/)
  let paragraphs = 0, inPara = false
  let longestLine = 0
  for (const line of rawLines) {
    if (line.length > longestLine) longestLine = line.length
    const isBlank = !line.trim()
    if (!isBlank && !inPara) { paragraphs++; inPara = true }
    else if (isBlank) inPara = false
  }

  const words = countWords(text)
  const sentences = countSentences(text)
  const nonCjkWords = words - cjk
  const wpmMs = (nonCjkWords / 250) * 60_000
  const cpmMs = (ascii / 1000) * 60_000
  const nonEmptyLines = rawLines.filter(l => l.trim()).length
  return {
    chars: text.length,
    charsNoSpace,
    bytes: new TextEncoder().encode(text).length,
    lines: rawLines.length,
    nonEmptyLines,
    paragraphs,
    words,
    sentences,
    cjk, ascii, digits, punctuation, spaces, others,
    readingMs: (cjk / 400) * 60_000 + Math.max(wpmMs, cpmMs),
    // 派生: 阅读/排版相关指标
    avgSentenceLength:  sentences > 0 ? Math.round(charsNoSpace / sentences) : 0,
    avgWordLength:      words    > 0 ? charsNoSpace / words : 0,
    longestLine,
    avgLinesPerParagraph: paragraphs > 0 ? nonEmptyLines / paragraphs : 0,
  }
}
</script>

<style lang="scss" scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 600px) {
  .stat-grid {
    grid-template-columns: 1fr;
    gap: var(--tool-section-gap, 20px);
  }
}

.reading-card {
  margin-top: var(--tool-section-gap, 20px);
}

.stat-card__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--it-text-primary);
  margin-bottom: 10px;
  letter-spacing: 0.02em;
}

.stat-card__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.stat-card__item {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 13px;
}

.stat-card__label { color: var(--it-text-secondary); }

/* .stat-card__value — mono / 14 / 600 / primary / tabular-nums 已由
   ~/styles/_tool-recipes.scss 全局 .result-mono utility 提供, 模板
   里 <span class="stat-card__value result-mono"> 自动套用。 */

.reading-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  height: 64px;
  overflow: hidden;
}

.reading-block {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reading-block__label {
  font-size: 12px;
  color: var(--it-text-secondary);
}

.reading-block__value {
  font-size: 18px;
  font-weight: 600;
  color: var(--it-text-primary);
  white-space: nowrap;
}

.reading-block__value--small {
  font-size: 12px;
  font-weight: 400;
  color: var(--it-text-secondary);
}
</style>
