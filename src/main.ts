/*
  src/main.ts — 应用入口，同时服务两种构建模式。

  - 纯 SPA (`npm run build`)：vite-ssg 的客户端分支检测到浏览器环境后
    自动 createSSRApp + mount('#app', true) 完成挂载。
  - 静态预渲染 (`npm run generate`)：vite-ssg 在 Node 侧调用
    createApp(false, route) 拿到 app/router，渲染成 HTML 字符串。

  因此入口必须导出 `createApp`，且**不能**在模块顶层做浏览器专属的
  副作用（createWebHistory / document 操作 / 裸 .scss 导入）。
*/
// vue 必须排在 vite-ssg 之前求值。
//
// vite-ssg 依赖 vue-router，而 vue-router 在模块顶层就调用 defineComponent()。
// Vite dev 的依赖预打包会把 vue / vue-router 拆到不同的 chunk 里，而
// @vue/shared 的初始化是惰性的（esbuild 的 __esm 包装）—— 一旦 vue-router 的
// chunk 先于 vue 的 chunk 求值，defineComponent 内部读到的 isFunction 仍是
// undefined，页面直接白屏：
//   Uncaught TypeError: isFunction is not a function
// 这里用一条副作用 import 把 vue 的求值顺序钉在最前面。
import 'vue'
import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { routes } from './router'
import { i18n } from '~/locales'
import { ID_INJECTION_KEY, ZINDEX_INJECTION_KEY } from 'element-plus'

import VueDiff from 'vue-diff'
import 'vue-diff/dist/index.css'

import '~/styles/index.scss'

// ElMessage 的样式。ElementPlusResolver 只处理模板里用到的组件，
// ElMessage 是命令式 API，不走模板，因此要单独引样式。
//
// 必须引 SCSS **源码**（src/message.scss），不能引预编译的
// theme-chalk/el-message.css：
//   - 本项目把 element-plus 命名空间改成了 `ep-`（styles/element/index.scss），
//     预编译 css 里的选择器/变量全是 `el-` 前缀，与运行时输出的
//     `ep-message` class 对不上 → 样式全部落空，toast 变成无样式的裸文本
//     （position/padding/背景色全丢），还会因 position:static 挤动页面布局。
//   - 走 SCSS 源码后，vite 的 scss additionalData 会注入
//     `@use "~/styles/element/index.scss"`，从而继承 `ep-` 命名空间，
//     产出的选择器与运行时 class 一致。
//
// 早前这里用预编译 css 是为了绕开「裸 scss 在 Node 侧 SSR 构建报
// ERR_UNKNOWN_FILE_EXTENSION」——那个问题只发生在被 ssr.externalize 的
// 依赖上；element-plus 已在 vite.config.ts 的 ssr.noExternal 里，
// 自身的 SCSS 由 Vite 打包，不会走 Node 原生 require。
import 'element-plus/theme-chalk/src/message.scss'

export const createApp = ViteSSG(
  App,
  { routes },
  ({ app }) => {
    // i18n must be registered before router/VueDiff so any plugin that
    // reaches for $t / useI18n() during install finds the i18n context.
    app.use(i18n)
    app.use(VueDiff)

    // element-plus 的 useId() / useZIndex() 在服务端渲染时会用随机值或共享
    // 计数器生成 id，客户端水合时又算一遍 → 两者对不上，hydration 失败。
    // 固定初始值并让计数器从 0 开始，服务端与客户端就能产出完全一致的结果。
    app.provide(ID_INJECTION_KEY, { prefix: 1024, current: 0 })
    app.provide(ZINDEX_INJECTION_KEY, { current: 0 })
  },
)
