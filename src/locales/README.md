# i18n Key 命名规范

`src/locales/{zh-CN,en-US}/index.json` 是所有 i18n 文案的唯一来源。本文档规定 key 的层级与命名约束，新增 / 修改 key 时必须遵守。

## 顶层结构（保留区）

| 顶层 key | 用途 | 维护方 |
|---|---|---|
| `common` | 全站通用文案（主题、剪贴板反馈等） | 所有人，新增前先看是否已有 |
| `header` / `sidebar` / `home` / `notFound` / `palette` | 全局布局组件 | 全局组件维护者 |
| `toolcard` | 工具卡片（首页 / 收藏） | 卡片维护者 |
| `lang` | 语言切换器显示名 | 翻译维护者 |
| `tools.<toolKey>` | **registry 强制**：每个工具的 `name` / `desc` | 由 `src/tools/registry.ts` 单一来源，**禁止**手改 |
| `<toolKey>Page` | 该工具页面**内部**的所有文案 | 工具作者 |

> `<toolKey>` 跟 `src/views/<toolKey>/` 路径必须完全一致（如 `qrcode` 对应 `qrcodePage`，`json` 也叫 `jsonPage`——**url 路径和 i18n key 可以不同名，但 key 必须跟 view 目录名一致**）。

## 工具页面 (`<toolKey>Page`) 子结构

第二层是「**用途分类**」，仅允许从下表选，禁止自创：

| 子 key | 用途 | 例子 |
|---|---|---|
| `action` | 按钮文字 / 触发动作 | `action.encode`、`action.clear`、`action.copy` |
| `field` | 表单字段名（label） | `field.data`、`field.key`、`field.iv` |
| `input` | 输入区相关（placeholder、meta、help） | `input.placeholder`、`input.charCount`、`input.clear` |
| `result` | 输出区相关 | `result.placeholder`、`result.label` |
| `section` | 卡片 / 分区标题 | `section.source`、`section.result` |
| `placeholder` | 字段占位符（也可放在 `input` / `field` 下，按页面粒度选一） | `placeholder.data` |
| `error` | 错误提示文案 | `error.empty`、`error.invalidTimestamp` |
| `message` | 操作反馈（成功 / 失败 toast） | `message.encryptSuccess`、`message.error` |
| `empty` | 空状态文案 | `empty`、`empty.input` |
| `options` | 配置项标签（mode / type / level 等） | `options.type`、`options.mode`、`options.verbose` |
| `stats` / `score` / `feedback` / `symbol` / `diagram` / `preset` / `reading` / `group` / `lap` / `crackTime` | 业务专属子区，可自创，但**只允许第三层**起使用，**第二层**只能从上表选 | `stats.length`、`score.level.0`、`feedback.rules.length` |
| `level` / `rules` / `bits` / `label` / `value` / `title` / `desc` | 第四层业务数据（仅在第三层业务子区下） | `score.level.0`、`label` |

## 命名规则

1. **kebab-case 不用**，**camelCase**。多单词一律驼峰：`charCount`、`emptyLine`、`invalidTimestamp`。
2. **不要带工具名前缀**（已经在 `<toolKey>Page` 这一层表达了）。`jsonPage.encode` 不对，`jsonPage.action.encode` 对。
3. **占位符用 ICU 风格**：`{n}`、`{chars}`、`{s}`，模板里 `t('key', { n: 5 })`。
4. **数字 key 走字符串**：`score.level.0`、`preset.1min` 都用 `0` / `1min` 这种字符串形态，**不**用数组下标。
5. **不要做无意义嵌套**：`x.y` 能表达就不写 `x.y.z.w`。最深允许 4 层（如 `passwordStrengthPage.score.level.0`），**超过 4 层说明该拆成独立字段**。

## 新增工具 checklist

1. `src/tools/registry.ts` 加条目（自动同步侧边栏 / 首页 / 搜索）。
2. `src/views/<toolKey>/<toolKey>.vue` 写组件。
3. `src/locales/zh-CN/index.json` 加 `tools.<toolKey>.name` / `tools.<toolKey>.desc`。
4. `src/locales/en-US/index.json` 同上。
5. 同一 PR 里**同步**两份 locale 文件，缺一即漏。
6. 页面内部用 `<toolKey>Page.<子结构>.<key>`，从本文档「子结构」表里选。

## 反例

```jsonc
// 错：自创子结构
"hashPage": {
  "counter": "字符数",   // 应该用 input.charCount
  "clearButton": "清空"   // 应该用 input.clear
}

// 错：snake_case
"base64Page": {
  "char_count": 0
}

// 错：工具名前缀
"base64Page": {
  "base64Encode": "Base64 编码"  // 已经在 base64Page 下了
}

// 错：超过 4 层
"passwordStrengthPage": {
  "feedback": {
    "rules": {
      "length": {
        "label": "至少 8 位",  // 4 层 OK
        "color": "success"     // 5 层——拆出去
      }
    }
  }
}
```

## 维护

- 改完两个 locale 文件后跑 `npm run build` 确认无 TS / 编译错。
- 删除 UI 字段时**同步**删 i18n key，别留 unused 字段。
- 大改动（重构某页）前看一眼「子结构」表，决定新的子结构是复用还是新增——能复用就不新增。
