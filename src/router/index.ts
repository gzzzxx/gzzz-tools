/* router/index.ts — 路由表定义（无副作用）。
 *
 * 这里只导出纯数据 `routes`，**不**创建 router 实例。
 *
 * 原因：SSG (vite-ssg) 的服务端构建会在 Node 里加载入口模块，
 * 而 `createWebHistory()` 需要浏览器环境 —— 在模块顶层调用会直接
 * 抛 `window is not defined`，整个 SSG 构建失败。
 *
 * router 实例由谁创建：
 *   - 纯 SPA (npm run build)：由 vite-ssg 的客户端分支自动创建
 *   - SSG  (npm run generate)：由 vite-ssg 按环境选择 history 实现
 *     （服务端 createMemoryHistory / 客户端 createWebHistory）
 */
import type { RouteRecordRaw } from 'vue-router'
import { tools } from '~/tools/registry'

const toolRoutes: RouteRecordRaw[] = tools.map(tool => ({
  path: tool.path,
  component: tool.component,
}))

export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'index', component: () => import('~/views/home/home.vue') },
  { path: '/about', name: 'about', component: () => import('~/views/about/about.vue') },
  // 静态托管的 404 兜底页。GitHub Pages 之类遇到未知路径时只会去找根目录的
  // 404.html —— SSG 会预渲染出 /404/index.html，构建结束后再复制一份到根目录。
  { path: '/404', name: 'not-found-page', component: () => import('~/views/not-found/not-found.vue') },
  // Catch-all — any URL that didn't match a tool or /about lands on
  // the 404 view. Required for history-mode SPA so direct visits and
  // shared links to unknown paths render a styled page instead of a
  // blank one (and so static-host 404.html fallbacks route cleanly).
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('~/views/not-found/not-found.vue') },
  ...toolRoutes,
]
