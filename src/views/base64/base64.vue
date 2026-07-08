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

      <CardPane class="base64-card" :title="t('base64Page.section.result')" body-padding="0">
        <template #actions>
          <el-button
            size="small"
            :icon="DocumentCopy"
            link
            :disabled="!form.result"
            @click="copyData"
          >
            {{ t('base64Page.action.copy') }}
          </el-button>
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
          <strong>Base64 编码说明</strong>
        </p>
        <p class="prose-para">
          <span class="prose-term">Base64 </span>
          <span>是一种基于 64 个可打印字符来表示二进制数据的表示方法，由于 2^6=64，所以每 6 个比特为一个单元，对应某个可打印字符。</span>
        </p>
        <p class="prose-para">
          <span class="prose-term">Base64 </span>
          <span>常用于在通常处理文本数据的场合，表示、传输、存储一些二进制数据，包括 MIME 的电子邮件及 XML 的一些复杂数据。</span>
        </p>
        <p class="prose-para">
          <span class="prose-term">Base64 </span>
          <span>编码要求把 3 个 8 位字节（3*8=24）转化为 4 个 6 位的字节（4*6=24），之后在 6 位的前面补两个 0，形成 8 位一个字节的形式。 如果剩下的字符不足 3 个字节，则用 0 填充，输出字符使用 =，因此编码后输出的文本末尾可能会出现 1 或 2 个 =。</span>
        </p>
        <p class="prose-para">
          <span>为了保证所输出的编码位可读字符，</span>
          <span class="prose-term">Base64 </span>
          <span>制定了一个编码表，以便进行统一转换。编码表的大小为</span>
          <span class="prose-term"> 2^6=64 </span>
          <span>，这也是</span>
          <span class="prose-term"> Base64 </span>
          <span>名称的由来。</span>
        </p>
        <p class="prose-para">
          <span>在 </span>
          <span class="prose-term"> Base64 </span>
          <span>中的可打印字符包括字母</span>
          <span class="prose-term"> A-Z </span>
          <span>、</span>
          <span class="prose-term"> a-z </span>
          <span>、数字</span>
          <span class="prose-term"> 0-9 </span>
          <span>，这样共有 62 个字符，此外两个可打印符号在不同的系统中而不同。</span>
        </p>
        <p class="prose-para">
          <span>以下是</span>
          <span class="prose-term"> Base64 </span>
          <span>编码的基本步骤：</span>
        </p>
        <ul class="prose-list">
          <li>将数据划分为 3 个字节一组（24位）。</li>
          <li>将每个字节转换为 8 位二进制形式。</li>
          <li>将 24 位数据按照 6 位一组进行划分，得到 4 个 6 位的组。</li>
          <li>将每个 6 位的组转换为对应的 Base64 字符。</li>
          <li>如果数据不足 3 字节，进行填充。</li>
          <li>将所有转换后的 Base64 字符连接起来，形成最终的编码结果。</li>
        </ul>
        <p class="prose-para">
          <span>解码</span>
          <span class="prose-term"> Base64 </span>
          <span>编码的过程与编码相反，将每个 Base64 字符转换为对应的6位二进制值，然后将这些 6 位值组合成原始的二进制数据。</span>
        </p>
        <p class="prose-para">
          <span class="prose-term">Base64 </span>
          <span>编码具有以下特点：</span>
        </p>
        <ul class="prose-list">
          <li>编码后的数据长度总是比原始数据长约 1/3。</li>
          <li>编码后的数据可以包含 A-Z、a-z、0-9 和两个额外字符的任意组合。</li>
          <li>Base64 编码是一种可逆的编码方式，可以通过解码还原原始数据。</li>
        </ul>

        <p class="prose-para">
          <strong>Base64 编码表</strong>
        </p>
        <el-table
          :data="tableData"
          :span-method="objectSpanMethod"
          border
          stripe
          class="base64-reference__table"
        >
          <el-table-column label="码值" prop="1" />
          <el-table-column label="字符" prop="2" />
          <el-table-column width="120" />
          <el-table-column label="码值" prop="3" />
          <el-table-column label="字符" prop="4" />
          <el-table-column width="120" />
          <el-table-column label="码值" prop="5" />
          <el-table-column label="字符" prop="6" />
          <el-table-column width="120" />
          <el-table-column label="码值" prop="7" />
          <el-table-column label="字符" prop="8" />
        </el-table>

        <p class="prose-para">
          举例来说，一段引用自托马斯·霍布斯《利维坦》的文本：
        </p>
        <div class="base64-reference__quote">
          Man is distinguished, not only by his reason, but by this singular passion from other animals, which is a lust of the mind, that by a perseverance of delight in the continued and indefatigable generation of knowledge, exceeds the short vehemence of any carnal pleasure.
        </div>

        <p class="prose-para">
          使用 Base64 编码之后变成：
        </p>
        <div class="base64-reference__quote">
          TWFuIGlzIGRpc3Rpbmd1aXNoZWQsIG5vdCBvbmx5IGJ5IGhpcyByZWFzb24sIGJ1dCBieSB0aGlzIHNpbmd1bGFyIHBhc3Npb24gZnJvbSBvdGhlciBhbmltYWxzLCB3aGljaCBpcyBhIGx1c3Qgb2YgdGhlIG1pbmQsIHRoYXQgYnkgYSBwZXJzZXZlcmFuY2Ugb2YgZGVsaWdodCBpbiB0aGUgY29udGludWVkIGFuZCBpbmRlZmF0aWdhYmxlIGdlbmVyYXRpb24gb2Yga25vd2xlZGdlLCBleGNlZWRzIHRoZSBzaG9ydCB2ZWhlbWVuY2Ugb2YgYW55IGNhcm5hbCBwbGVhc3VyZS4=
        </div>

        <p class="prose-para">
          编码 "Man" 的结果为 TWFu，转换过程如下：
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
          <el-table-column prop="1"  min-width="50px" />
          <el-table-column prop="2"  min-width="50px" />
          <el-table-column prop="3"  min-width="50px" />
          <el-table-column prop="4"  min-width="50px" />
          <el-table-column prop="5"  min-width="50px" />
          <el-table-column prop="6"  min-width="50px" />
          <el-table-column prop="7"  min-width="50px" />
          <el-table-column prop="8"  min-width="50px" />
          <el-table-column prop="9"  min-width="50px" />
          <el-table-column prop="10" min-width="50px" />
          <el-table-column prop="11" min-width="50px" />
          <el-table-column prop="12" min-width="50px" />
          <el-table-column prop="13" min-width="50px" />
          <el-table-column prop="14" min-width="50px" />
          <el-table-column prop="15" min-width="50px" />
          <el-table-column prop="16" min-width="50px" />
          <el-table-column prop="17" min-width="50px" />
          <el-table-column prop="18" min-width="50px" />
          <el-table-column prop="19" min-width="50px" />
          <el-table-column prop="20" min-width="50px" />
          <el-table-column prop="21" min-width="50px" />
          <el-table-column prop="22" min-width="50px" />
          <el-table-column prop="23" min-width="50px" />
          <el-table-column prop="24" min-width="50px" />
          <el-table-column prop="25" min-width="50px" />
          <el-table-column prop="26" min-width="50px" />
          <el-table-column prop="27" min-width="50px" />
        </el-table>
      </div>
    </CardPane>
  </ToolPage>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import {
  Brush,
  Delete,
  DocumentCopy,
  SwitchFilled,
} from '@element-plus/icons-vue'
import { Base64 } from 'js-base64'
import type { TableColumnCtx } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useClipboard } from '~/composables/useClipboard'

const { t } = useI18n({ useScope: 'global' })
const { copy } = useClipboard()

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

function copyData() {
  copy(form.result)
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
