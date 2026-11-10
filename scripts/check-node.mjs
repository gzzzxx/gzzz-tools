// 构建前置检查：Node 版本必须 >= 18（与 package.json 的 engines、.nvmrc 一致）。
//
// 为什么需要它：
// vite-ssg 的渲染阶段依赖 jsdom → cssstyle，而 cssstyle 里用了 ES2021 的
// 逻辑赋值运算符 `||=`。Node 14 / 16 不认识这个语法，会抛
//   SyntaxError: Unexpected token '||='
// 更坑的是老版本 Node 对 unhandled rejection 只打警告不退出，于是命令
// 「看起来成功」（退出码 0），实际上一张预渲染页面都没产出 —— dist 里只剩
// 客户端构建的空壳，部署上去全是 404。
//
// 用法：package.json 的 pregenerate 钩子自动执行。
//
// 只挂在 generate 上，不挂 dev / build：
//   - dev 在 Node 14 上能正常跑（Vite 4 支持 ^14.18），拦它只会打断日常开发
//   - build（SPA）在 Node 14 上也能出正确产物
//   - generate 在 Node 14 上会「假成功」：退出码 0，但 dist 里一张预渲染页面都没有，
//     部署上去全是 404 —— 这才是必须拦住的场景

const REQUIRED = 18
const current = Number(process.versions.node.split('.')[0])

if (current >= REQUIRED) {
  process.exit(0)
}

console.error(
  [
    '',
    `✗ 当前 Node 版本 v${process.versions.node}，本项目要求 >= ${REQUIRED}。`,
    '',
    '  vite-ssg 的预渲染链路（jsdom → cssstyle）用了 ES2021 的 `||=` 语法，',
    '  Node 14/16 跑不了；而且老 Node 对 unhandled rejection 只警告不退出，',
    '  构建会「假成功」—— 退出码 0，但 dist 里一张预渲染页面都没有。',
    '',
    '  修复：',
    '    nvm use 18        # 本机已装 v18.20.8',
    '    nvm install 18    # 没有的话先装',
    '',
  ].join('\n')
)

process.exit(1)
