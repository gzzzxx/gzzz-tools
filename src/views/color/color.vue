<!-- 颜色选择器工具，支持多种 picker 模式和颜色格式展示 -->

<template>
  <ToolPage
    class="color-page"
    preset="large-form"
    :title="t('tools.color.name')"
    :subtitle="t('tools.color.desc')"
  >
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

import { parseSearchParams } from './utils'
const pickers = ['chrome', 'sketch', 'photoshop', 'compact', 'grayscale', 'material', 'slider', 'twitter', 'swatches', 'hue', 'sliders'] as const;
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
const isDarkInitial = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
const initialColor = `${searchParams.hex ?? isDarkInitial ? DEFAULT_COLOR_DARK : DEFAULT_COLOR}`;
</script>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useT } from '~/composables/useT'

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
} from 'vue-color'
import 'vue-color/style.css'
import { useIsDark } from '~/composables/useIsDark'

const { t } = useT()

const showStatus: Record<(typeof pickers)[number], boolean> = {} as Record<(typeof pickers)[number], boolean>;
pickers.forEach((picker) => {
  if (!manualEnabledPickers || manualEnabledPickers.length === 0) {
    showStatus[picker] = true;
  } else {
    showStatus[picker] = manualEnabledPickers.indexOf(picker) > -1;
  }
});

const isDark = useIsDark();

const tinyColor = defineModel('tinyColor', {
  default: tinycolor(initialColor)
});

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
.wrapper {
  display: flex;
  padding: 3%;
  background-color: v-bind(hex);
  border-radius: 4px;
}

.picker-containers {
  flex: 1;
}

.text {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  font-optical-sizing: auto;
  font-style: normal;
  font-variation-settings: "wdth" 100;
  color: v-bind(textColor);
}

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
