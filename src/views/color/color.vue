<!--
  color.vue — multi-picker color playground (vue-color 上游 demo 容器).

  对比其他工具页面 (双栏 / 1输入-N输出 / 居中 t-card):
    - 11 种 picker 网格展示: 不走"单功能"工具模式, 而是把各种 picker
      横向铺开供用户选
    - .text 动态反色: 让 current-color / picker-title 文字在任意
      用户选色背景下都可读

  与其他工具页面的统一点:
    - <ToolPage> 卡片外壳: max-width 1600px 居中, 跟随 light/dark
      主题 (var(--ep-bg-color) + var(--it-text-primary))
    - title / subtitle 走 i18n (复用 tools.color.name /
      tools.color.desc, 已在 locales 配好)

  内部布局 (100% 保留原版, 不做重排或紧凑化):
    - 外层 .picker-containers 嵌套 3 行 .row
    - 第一行 3 col: 第一个 col 顶部是 hex/rgb/hsv 文字 + ChromePicker
    - 第二行 3 col: Compact/Grayscale/Material (stack) | Hue/Slider/Twitter (stack) | Swatches
    - 第三行 3 col: RGBSliders | HSVSliders | HSLSliders
    - 全部 picker-title 文字保留 (&lt;ChromePicker /&gt; 这种代码名)

  URL 参数:
    - ?hex=XXXXXX   初始选色 (覆盖默认)
    - ?picker=a,b,c  指定启用的 picker 列表 (默认全部)
-->
<template>
  <ToolPage
    preset="large-form"
    :title="t('tools.color.name')"
    :subtitle="t('tools.color.desc')"
  >
    <!-- .wrapper 内部色块容器: background-color 跟随用户选色,
         跟 .text 反色文字配对 — 保证 current-color / picker-title
         文字在任意选色下都可读 (color 工具核心 UX)。
         外层 <ToolPage> 仍然跟随 light/dark 主题, 内部色块不破坏
         卡片化。 -->
    <div class="wrapper" :style="{ backgroundColor: hex }">
      <div class="picker-containers">
      <div class="row">
        <div class="col">
          <div class="text current-color">
            {{ hex }}<br />
            {{ tinyColor.toRgbString() }}<br />
            {{ tinyColor.toHsvString() }}
          </div>
          <div v-if="showStatus.chrome">
            <ChromePicker v-model:tinyColor="tinyColor" v-model="color" />
            <div class="picker-title text">&lt;ChromePicker /&gt;</div>
          </div>
        </div>

        <div class="col" v-if="showStatus.sketch">
          <div><SketchPicker v-model:tinyColor="tinyColor" v-model="color" /></div>
          <div class="picker-title text">&lt;SketchPicker /&gt;</div>
        </div>

        <div class="col" v-if="showStatus.photoshop">
          <div><PhotoshopPicker v-model:tinyColor="tinyColor" v-model="color" /></div>
          <div class="picker-title text">&lt;PhotoshopPicker /&gt;</div>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <div v-if="showStatus.compact">
            <div><CompactPicker v-model:tinyColor="tinyColor" v-model="color" /></div>
            <div class="picker-title text">&lt;CompactPicker /&gt;</div>
          </div>
          <div v-if="showStatus.grayscale">
            <div><GrayscalePicker v-model:tinyColor="tinyColor" v-model="color" /></div>
            <div class="picker-title text">&lt;GrayscalePicker /&gt;</div>
          </div>
          <div v-if="showStatus.material">
            <div><MaterialPicker v-model:tinyColor="tinyColor" v-model="color" /></div>
            <div class="picker-title text">&lt;MaterialPicker /&gt;</div>
          </div>
        </div>

        <div class="col">
          <div v-if="showStatus.hue">
            <div :style="{width: '410px'}"><HueSlider :modelValue="hsva.h" @update:modelValue="updateHue" /></div>
            <div class="picker-title text">&lt;HueSlider /&gt;</div>
          </div>

          <div v-if="showStatus.slider">
            <div><SliderPicker v-model:tinyColor="tinyColor" v-model="color" :alpha="true" /></div>
            <div class="picker-title text">&lt;SliderPicker /&gt;</div>
          </div>

          <div v-if="showStatus.twitter">
            <div><TwitterPicker v-model:tinyColor="tinyColor" v-model="color" /></div>
            <div class="picker-title text">&lt;TwitterPicker /&gt;</div>
          </div>
        </div>

        <div class="col">
          <div v-if="showStatus.swatches">
            <div><SwatchesPicker v-model:tinyColor="tinyColor" v-model="color" /></div>
            <div class="picker-title text">&lt;SwatchesPicker /&gt;</div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col" :style="{width: '330px'}">
          <RGBSliders v-model:tinyColor="tinyColor" v-model="color" />
          <div class="picker-title text">&lt;RGBASliders /&gt;</div>
        </div>
        <div class="col" :style="{width: '330px'}">
          <HSVSliders v-model:tinyColor="tinyColor" v-model="color" />
          <div class="picker-title text">&lt;HSVSliders /&gt;</div>
        </div>
        <div class="col" :style="{width: '330px'}">
          <HSLSliders v-model:tinyColor="tinyColor" v-model="color" />
          <div class="picker-title text">&lt;HSLSliders /&gt;</div>
        </div>
      </div>
      </div>
    </div>
  </ToolPage>
</template>

<script lang="ts">
const DEFAULT_COLOR = 'F5F7FA';
const DEFAULT_COLOR_DARK = '#004035';

import { parseSearchParams } from './utils';
const pickers = ['chrome', 'sketch', 'photoshop', 'compact', 'grayscale', 'material', 'slider', 'twitter', 'swatches', 'hue', 'sliders'] as const;
// typeof guards: vite-ssg build (prerender) 在 node 环境跑, document /
// location 都不可用, 这里加 typeof 检查让 SSR / SSG 阶段拿到 fallback
// 而不是抛错。
const searchParams = parseSearchParams(
  typeof location !== 'undefined' ? location.search : '',
);
const manualEnabledPickers = searchParams.picker?.split(',');

function invertColor({ r, g, b, a}: { r: number; g: number; b: number, a: number }): string {
  const invert = (val: number, alpha: number) => alpha === 0 ? 0 : 255 - val;
  const inverted = {
    r: invert(r, a),
    g: invert(g, a),
    b: invert(b, a),
    a: a < 0.5 ? 1 - a : a
  };
  return `rgba(${inverted.r}, ${inverted.g}, ${inverted.b}, ${inverted.a})`;
}

const hasInitialColor = !!searchParams.hex;
// typeof guard: vite-ssg build (prerender) 在 node 环境跑, document
// 不可用, 这里加 typeof 检查让 SSR / SSG 阶段拿到 fallback 而不是抛错。
const isDarkInitial = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
// initialColor — 用于 tinycolor / color defineModel 的 default,
// 也供 setup script 切主题时重置 tinycolor 参考。优先级: URL hex
// (?hex=XXXXXX) > 当前主题默认色。
const initialColor = `${searchParams.hex ?? isDarkInitial ? DEFAULT_COLOR_DARK : DEFAULT_COLOR}`;
</script>

<script setup lang="ts">
import { computed, reactive, ref, onMounted, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  ChromePicker,
  SketchPicker,
  PhotoshopPicker,
  CompactPicker,
  GrayscalePicker,
  MaterialPicker,
  SliderPicker,
  TwitterPicker,
  SwatchesPicker,
  HueSlider,
  HSLSliders,
  HSVSliders,
  RGBSliders,
  tinycolor
} from 'vue-color';
import 'vue-color/style.css';

const { t } = useI18n({ useScope: 'global' });

const showStatus: Record<(typeof pickers)[number], boolean> = {} as Record<(typeof pickers)[number], boolean>;
pickers.forEach((picker) => {
  if (!manualEnabledPickers || manualEnabledPickers.length === 0) {
    showStatus[picker] = true;
  } else {
    showStatus[picker] = manualEnabledPickers.indexOf(picker) > -1;
  }
});

// 主题感知 — 用 MutationObserver 直接监听 html.dark class 变化.
// 为什么不用 useDark / useColorMode: useColorMode 是单向同步
// (state ref → html class), 它**不**读 html class 变化, 所以
// App.vue 手动改的 html class 对它**不可见**。BaseHeader.vue 也
// 是用同样的 MutationObserver 模式 (L321-340)。onMounted 里同步
// 读一次 class 拿到初始值, 之后 MutationObserver 监听后续变化。
const isDark = ref(false)
let themeObserver: MutationObserver | null = null

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark')
  themeObserver = new MutationObserver(() => {
    isDark.value = document.documentElement.classList.contains('dark')
  })
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
})

onUnmounted(() => {
  themeObserver?.disconnect()
})

const tinyColor = defineModel('tinyColor', {
  default: tinycolor(initialColor)
});

// 主题切换 → 自动重置 tinycolor 为对应主题默认色
// 让 .wrapper 背景 (v-bind(hex)) 跟随主题变化 — 切到 light mode 时
// 背景自动变浅, 切到 dark mode 时自动变深。User 主动用 picker 选色后
// 会立即覆盖, 选色状态会持续到下次主题切换或下次选色。
// URL 显式指定 ?hex= 时不重置 (让 URL 控制优先级最高)。
watch(isDark, (newIsDark) => {
  if (hasInitialColor) return;
  tinyColor.value = tinycolor(newIsDark ? DEFAULT_COLOR_DARK : DEFAULT_COLOR);
});

const color = defineModel({
  default: () => {
    if (hasInitialColor) {
      return initialColor;
    }
    // #F5F7FA
    return reactive({r: 245, g: 247, b: 250, a: 1})
  }
});

const hex = computed(() => {
  return tinycolor(tinyColor.value).toHex8String();
});

const hsva = computed(() => {
  const hsva = tinycolor(tinyColor.value).toHsv();
  const res: Record<string, number> = {};
  for (const [key, value] of Object.entries(hsva)) {
    res[key] = Number(value.toFixed(2));
  }
  return res;
});

const textColor = computed(() => {
  return invertColor(tinycolor(tinyColor.value).toRgb());
});

const updateHue = (newHue: number) => {
  tinyColor.value = tinycolor(tinyColor.value).spin(newHue - hsva.value.h).clone();
}
</script>

<style lang="scss" scoped>
/* .wrapper — 内部色块容器, background-color 跟随用户当前选色,
   跟 .text 反色文字配对 — 保证 current-color / picker-title
   文字在任意选色下都可读 (color 工具核心 UX)。
   外层 <ToolPage> 仍然跟随 light/dark 主题, 内部色块不破坏
   卡片化 — 是"外卡片化 + 内动态色块"双层结构。 */
.wrapper {
  display: flex;
  padding: 3%;
  background-color: v-bind(hex);
  border-radius: 4px;
}

/* .picker-containers — 在 .wrapper (flex 父) 内 grow, 吃满 3% padding
   之后剩余的所有横向空间。 */
.picker-containers {
  flex: 1;
}

/* .text — 动态反色, 让 current-color / picker-title 文字在
   .wrapper (动态色块) 背景下都可读。 */
.text {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  font-optical-sizing: auto;
  font-style: normal;
  font-variation-settings: "wdth" 100;
  color: v-bind(textColor);
}

/* picker 网格 — 完全保留原版 3 行结构 + 3% gap / 3% margin。
   不做紧凑化或重排, 跟原 color 页面的视觉保持一致。 */
.row {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 3%;
  margin-bottom: 3%;
}

.picker-title {
  margin-top: 10px;
  margin-bottom: 20px;
  font-size: 14px;
  opacity: 0.75;
}

.current-color {
  margin-bottom: 10px;
  line-height: 1.7;
  opacity: 0.75;
}
</style>
