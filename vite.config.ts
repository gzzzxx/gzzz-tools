/// <reference types="vite-ssg" />
import fs from 'fs'
import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

const pathSrc = path.resolve(__dirname, 'src')

// https://vitejs.dev/config/
export default defineConfig(({ ssrBuild }) => ({
  // vite-ssg 预渲染的产物布局。
  // 默认的 flat 会把 `/color` 输出成 `/color.html` —— 静态托管（GitHub Pages）
  // 上访问 `/color` 会 404。nested 输出 `/color/index.html`，干净 URL 直接可用。
  ssgOptions: {
    dirStyle: 'nested',
    // 静态托管（GitHub Pages）遇到未知路径时，只会去找站点根目录下的 404.html。
    // 预渲染出来的 /404 就是那张兜底页（它不依赖具体路径），复制一份到根目录，
    // 这样任意未收录的 URL 也能落到站内样式一致的 404 页上。
    onFinished: async () => {
      const src = path.resolve(__dirname, 'dist/404/index.html')
      const dest = path.resolve(__dirname, 'dist/404.html')
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest)
      }
    },
  },
  resolve: {
    alias: {
      '~/': `${pathSrc}/`,
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "~/styles/element/index.scss" as *;`,
      },
    },
  },
  // vite-ssg 的 SSR 构建在 Node 里执行，这里有三类坑，都需要让 Vite 自己
  // 打包这几个依赖（而不是交给 Node 直接 import）：
  //
  // 1. element-plus：主题样式是 .scss 源码，一旦被 externalize，Node 会直接
  //    require 一个 .scss 文件 → ERR_UNKNOWN_FILE_EXTENSION。交给 Vite 后走
  //    sass 管线，与客户端构建共用同一套 additionalData 定制（`ep-` 命名空间 +
  //    自定义色板），保证预渲染 HTML 与客户端 DOM 结构一致。
  // 2. sm-crypto：CommonJS/UMD 包，Node 的 ESM 互操作无法静态分析出具名导出
  //    → "Named export 'sm4' not found"。
  // 3. cronstrue：`cronstrue/i18n` 是无扩展名的子路径，Node ESM 要求显式
  //    扩展名 → ERR_MODULE_NOT_FOUND。
  //
  // 注意不能用 noExternal: true —— 那会把 @vue/server-renderer 也打包进来，
  // 它依赖 node:stream，rollup 无法处理 Node 内置模块。
  ssr: {
    noExternal: ['element-plus', 'sm-crypto', 'cronstrue'],
  },
  build: ssrBuild
    ? {
        // vite-ssg 的 SSR 入口是 .mjs，但它拆分出来的动态 chunk 默认仍叫 .js。
        // 本项目 package.json 没有 "type": "module"，Node 会把 .js 当成 CJS 加载
        // → "Cannot use import statement outside a module"。SSR 产物的 chunk
        // 统一改成 .mjs 即可（只影响 .vite-ssg-temp 里的临时产物）。
        rollupOptions: {
          output: {
            chunkFileNames: 'assets/[name]-[hash].mjs',
          },
        },
      }
    : {},
  plugins: [
    vue(),
    Components({
      // allow auto load markdown components under `./src/components/`
      extensions: ['vue', 'md'],
      // allow auto import and register components used in markdown
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      resolvers: [
        ElementPlusResolver({
          importStyle: 'sass',
        }),
      ],
      dts: 'src/components.d.ts',
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 1000, // port,
    https: false
  },
}))
