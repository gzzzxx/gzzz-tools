<!-- Base64 编码/解码工具，两栏卡片布局，附带编码说明 -->

<template>
  <ToolPage
    class="base64-page"
    preset="wide-editor"
    :title="t('tools.base64.name')"
    :subtitle="t('tools.base64.desc')"
  >

    <div class="tool-toolbar">
      <el-button type="primary" :icon="SwitchFilled" @click="encode">
        {{ t('base64Page.action.encode') }}
      </el-button>
      <el-button :icon="Brush" @click="decode">
        {{ t('base64Page.action.decode') }}
      </el-button>
    </div>

    <div class="tool-grid">
      <CardPane class="base64-card" :title="t('base64Page.section.source')" body-padding="0">
        <template #actions>
          <el-button size="small" :icon="Delete" link @click="clear">
            {{ t('base64Page.action.clear') }}
          </el-button>
        </template>
        <ToolTextarea
          v-model="form.data"
          :rows="10"
          :placeholder="t('base64Page.input.placeholder')"
        />
      </CardPane>

      <CardPane class="base64-card" :title="t('base64Page.section.result')" variant="result" body-padding="0">
        <template #actions>
          <CopyButton
            variant="text"
            :text="form.result"
          >
            {{ t('base64Page.action.copy') }}
          </CopyButton>
        </template>
        <ToolTextarea
          v-model="form.result"
          :rows="10"
          :disabled="true"
          :placeholder="t('base64Page.result.placeholder')"
        />
      </CardPane>
    </div>

    <CardPane class="base64-reference" body-padding="0">
      <div class="base64-reference__body prose-body">
        <p class="prose-para">
          <strong>{{ t('base64Page.reference.title') }}</strong>
        </p>
        <!-- First 6 paragraphs: define Base64 + 编码要求 + 编码表 + 可打印字符 + 编码基本步骤 lead-in -->
        <p
          v-for="(text, i) in base64Paragraphs.slice(0, 6)"
          :key="`bp-${i}`"
          class="prose-para"
          v-html="text"
        />
        <ul class="prose-list">
          <li v-for="(step, i) in base64Steps" :key="`s${i}`">
            {{ step }}
          </li>
        </ul>
        <!-- Last 2 paragraphs: 解码过程 + 编码特点 lead-in -->
        <p
          v-for="(text, i) in base64Paragraphs.slice(6)"
          :key="`bp2-${i}`"
          class="prose-para"
          v-html="text"
        />
        <ul class="prose-list">
          <li v-for="(f, i) in base64Features" :key="`f${i}`">
            {{ f }}
          </li>
        </ul>

        <p class="prose-para">
          <strong>{{ t('base64Page.reference.tableHeader') }}</strong>
        </p>
        <el-table
          :data="tableData"
          :span-method="objectSpanMethod"
          border
          stripe
          class="base64-reference__table"
        >
          <!-- 4 blocks of (码值, 字符, separator). The blank
               width-120 column after each pair is the visual gutter
               between the 4 mini-tables; data keys 1..8 line up
               with the col props below. -->
          <template v-for="pair in 4" :key="pair">
            <el-table-column :label="t('base64Page.reference.codeValue')" :prop="String(pair * 2 - 1)" />
            <el-table-column :label="t('base64Page.reference.codeChar')"  :prop="String(pair * 2)" />
            <el-table-column v-if="pair < 4" width="120" />
          </template>
        </el-table>

        <p class="prose-para">
          {{ t('base64Page.reference.example.lead') }}
        </p>
        <div class="base64-reference__quote">
          {{ t('base64Page.reference.example.source') }}
        </div>

        <p class="prose-para">
          {{ t('base64Page.reference.example.encodedLead') }}
        </p>
        <div class="base64-reference__quote">
          {{ t('base64Page.reference.example.encoded') }}
        </div>

        <p class="prose-para">
          {{ t('base64Page.reference.example.manLead') }}
        </p>
        <el-table
          :data="tableDemoData"
          :span-method="demoObjectSpanMethod"
          border
          :show-header="false"
          class="base64-reference__table"
          :cell-style="{ textAlign: 'center' }"
          :header-cell-style="{ 'text-align': 'center' }"
        >
          <!-- Demo table mirrors the 27 cell positions in `tableDemoData`:
               3 original bytes + 24 binary bits + 4 base64 indices + 4 base64 chars.
               Column count is fixed by the data shape; the loop keeps the
               template compact and prevents silent drift if the data
               ever changes. The prop is a string because the data keys
               are stringified. -->
          <el-table-column
            v-for="n in 27"
            :key="n"
            :prop="String(n)"
            min-width="50px"
          />
        </el-table>
      </div>
    </CardPane>
  </ToolPage>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import {
  Brush,
  Delete,
  SwitchFilled,
} from '@element-plus/icons-vue'
import { Base64 } from 'js-base64'
import type { TableColumnCtx } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t, tm, locale } = useI18n({ useScope: 'global' })

// Reference prose lives as nested i18n keys (base64Page.reference.*).
// vue-i18n's t() flattens array paths (e.g. paragraphs.0) into a string,
// so we use tm() to read the raw array — which preserves HTML markup
// and reacts to locale changes just like t() does for plain strings.
// Reading `locale.value` inside the computed establishes an explicit
// dependency on the active language, so the array swaps when the user
// flips the language dropdown.
const base64Paragraphs = computed<string[]>(
  () => (locale.value, tm('base64Page.reference.paragraphs') as string[]),
)
const base64Steps = computed<string[]>(
  () => (locale.value, tm('base64Page.reference.steps') as string[]),
)
const base64Features = computed<string[]>(
  () => (locale.value, tm('base64Page.reference.features') as string[]),
)

const form = reactive({
  data: '',
  result: '',
})

function encode() {
  form.result = Base64.encode(form.data)
}

function decode() {
  form.result = Base64.decode(form.data)
}

function clear() {
  form.data = ''
  form.result = ''
}

interface Table {
  1: string; 2: string; 3: string; 4: string
  5: string; 6: string; 7: string; 8: string
}

interface TableDemo {
  1: string; 2: string; 3: string; 4: string
  5: string; 6: string; 7: string; 8: string
  9: string; 10: string; 11: string; 12: string
  13: string; 14: string; 15: string; 16: string
  17: string; 18: string; 19: string; 20: string
  21: string; 22: string; 23: string; 24: string
  25: string; 26: string; 27: string
}

interface SpanMethodProps {
  row: Table
  column: TableColumnCtx<Table>
  rowIndex: number
  columnIndex: number
}

interface DemoSpanMethodProps {
  row: TableDemo
  column: TableColumnCtx<TableDemo>
  rowIndex: number
  columnIndex: number
}

const objectSpanMethod = ({
  columnIndex,
  rowIndex,
}: SpanMethodProps) => {
  if ((columnIndex + 1) % 3 === 0) {
    if (rowIndex === 0) {
      return { rowspan: 16, colspan: 1 }
    } else {
      return { rowspan: 0, colspan: 0 }
    }
  }
}

const demoObjectSpanMethod = ({
  rowIndex,
  columnIndex,
}: DemoSpanMethodProps) => {
  if (columnIndex === 0) {
    return { rowspan: 1, colspan: 3 }
  }
  if (
    (rowIndex === 0 || rowIndex === 1) &&
    (columnIndex === 3 || columnIndex === 11 || columnIndex === 19)
  ) {
    return { rowspan: 1, colspan: 8 }
  }
  if (
    (rowIndex === 0 || rowIndex === 1) &&
    (columnIndex + 5) % 8 != 0
  ) {
    return { rowspan: 0, colspan: 0 }
  }
  if (rowIndex === 2 && (columnIndex === 1 || columnIndex === 2)) {
    return { rowspan: 0, colspan: 0 }
  }
  if (
    (rowIndex === 3 || rowIndex === 4) &&
    (columnIndex === 3 || columnIndex === 9 || columnIndex === 15 || columnIndex === 21)
  ) {
    return { rowspan: 1, colspan: 6 }
  }
  if (
    (rowIndex === 3 || rowIndex === 4) &&
    (columnIndex + 3) % 6 != 0
  ) {
    return { rowspan: 0, colspan: 0 }
  }
}

const tableData: Table[] = [
  {1: '0',  2: 'A', 3: '16', 4: 'Q', 5: '32', 6: 'g', 7: '48', 8: 'w'},
  {1: '1',  2: 'B', 3: '17', 4: 'R', 5: '33', 6: 'h', 7: '49', 8: 'x'},
  {1: '2',  2: 'C', 3: '18', 4: 'S', 5: '34', 6: 'i', 7: '50', 8: 'y'},
  {1: '3',  2: 'D', 3: '19', 4: 'T', 5: '35', 6: 'j', 7: '51', 8: 'z'},
  {1: '4',  2: 'E', 3: '20', 4: 'U', 5: '36', 6: 'k', 7: '52', 8: '0'},
  {1: '5',  2: 'F', 3: '21', 4: 'V', 5: '37', 6: 'l', 7: '53', 8: '1'},
  {1: '6',  2: 'G', 3: '22', 4: 'W', 5: '38', 6: 'm', 7: '54', 8: '2'},
  {1: '7',  2: 'H', 3: '23', 4: 'X', 5: '39', 6: 'n', 7: '55', 8: '3'},
  {1: '8',  2: 'I', 3: '24', 4: 'Y', 5: '40', 6: 'o', 7: '56', 8: '4'},
  {1: '9',  2: 'J', 3: '25', 4: 'Z', 5: '41', 6: 'p', 7: '57', 8: '5'},
  {1: '10', 2: 'K', 3: '26', 4: 'a', 5: '42', 6: 'q', 7: '58', 8: '6'},
  {1: '11', 2: 'L', 3: '27', 4: 'b', 5: '43', 6: 'r', 7: '59', 8: '7'},
  {1: '12', 2: 'M', 3: '28', 4: 'c', 5: '44', 6: 's', 7: '60', 8: '8'},
  {1: '13', 2: 'N', 3: '29', 4: 'd', 5: '45', 6: 't', 7: '61', 8: '9'},
  {1: '14', 2: 'O', 3: '30', 4: 'e', 5: '46', 6: 'u', 7: '62', 8: '+'},
  {1: '15', 2: 'P', 3: '31', 4: 'f', 5: '47', 6: 'v', 7: '63', 8: '/'},
]

const tableDemoData: TableDemo[] = [
  {1: '文本',         4: 'M',  12: 'a',  20: 'n'},
  {1: 'ASCII 编码',   4: '77', 12: '97', 20: '110'},
  {1: '二进制位', 2: '', 3: '',
   4: '0',  5: '1',  6: '0',  7: '0',  8: '1',  9: '1', 10: '0', 11: '1',
   12: '0', 13: '1', 14: '1', 15: '0', 16: '0', 17: '0', 18: '0', 19: '1',
   20: '0', 21: '1', 22: '1', 23: '0', 24: '1', 25: '1', 26: '1', 27: '0'},
  {1: '索引',         4: '19', 10: '22', 16: '5',  22: '46'},
  {1: 'Base64 编码',  4: 'T',  10: 'W',  16: 'F',  22: 'u'},
]
</script>

<style lang="scss" scoped>
.base64-reference {
  margin-top: var(--tool-section-gap, 20px);
}

.base64-reference__body {
  padding: 16px 20px 20px;
  overflow-x: auto;
}

.base64-reference :deep(.prose-list) li {
  margin: 2px 0;
}

.base64-reference__table {
  width: 100%;
  margin: 8px 0 16px;
}

.base64-reference__quote {
  margin: 6px 0 16px;
  padding: 12px 16px;
  background-color: var(--brand-primary-soft);
  border-left: 3px solid var(--brand-primary);
  border-radius: 0 4px 4px 0;
  font-family: var(--font-mono-code);
  font-size: 12.5px;
  line-height: 1.6;
  word-break: break-all;
  color: var(--it-text-primary);
}

@media (max-width: 600px) {
  .base64-reference__body { padding: 12px 14px 16px; }
}
</style>
