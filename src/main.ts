import { createApp } from "vue";
import App from "./App.vue";
import { initTheme } from "~/composables/useTheme";

// Apply the saved theme (or fall back to dark) before mounting so the
// first paint already has the right class on <html>. Without this
// step, the first render would briefly flash the default class.
initTheme();

import VueDiff from 'vue-diff';
import 'vue-diff/dist/index.css';

import "~/styles/index.scss";
import "uno.css";
import router from './router'
import { i18n } from '~/locales'

// If you want to use ElMessage, import it.
import "element-plus/theme-chalk/src/message.scss";

const app = createApp(App);
// i18n must be registered before router/VueDiff so any plugin that
// reaches for $t / useI18n() during install finds the i18n context.
app.use(i18n);
app.use(router);
app.use(VueDiff);
app.mount("#app");
