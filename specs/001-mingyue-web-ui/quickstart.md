# 快速上手（Quickstart）：mingyue-web 开发环境搭建

**日期**: 2026-03-30  
**分支**: `001-mingyue-web-ui`  
**技术栈**: Vue 3.5 + Vite 6 + Tailwind CSS v4 + TypeScript 5（strict）

---

## 前置条件

| 工具 | 版本要求 | 检查命令 |
|------|---------|---------|
| Node.js | ≥ 20.x LTS | `node -v` |
| npm | ≥ 10.x | `npm -v` |
| Git | 任意现代版本 | `git --version` |
| mingyue-go agent | 已在局域网运行（端口 7070） | `curl http://<agent-host>:7070/health` |

---

## 第一步：创建 Vue + Vite 项目

```bash
npm create vue@latest mingyue-web
```

在交互式向导中选择以下选项：

```
✔ Add TypeScript?                › Yes
✔ Add JSX Support?               › No
✔ Add Vue Router for SPA?        › Yes
✔ Add Pinia for state management? › Yes
✔ Add Vitest for Unit Testing?   › Yes
✔ Add an End-to-End Testing Solution? › Playwright
✔ Add ESLint for code quality?   › Yes
✔ Add Prettier for code formatting? › Yes
✔ Add Vue DevTools extension?    › Yes（可选，推荐开发时开启）
```

```bash
cd mingyue-web
npm install
```

---

## 第二步：安装项目依赖

```bash
# HTTP 客户端
npm install axios

# VueUse（轮询节制所需 composables）
npm install @vueuse/core

# 虚拟滚动（大列表渲染）
npm install @tanstack/vue-virtual

# Tailwind CSS v4
npm install -D tailwindcss @tailwindcss/vite

# MSW（集成测试 mock agent 响应）
npm install -D msw
```

---

## 第三步：配置 TypeScript strict 模式

编辑 `tsconfig.app.json`，确保以下选项开启（宪法原则 I）：

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

## 第四步：配置 Tailwind CSS v4

编辑 `vite.config.ts`：

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
})
```

在 `src/assets/main.css` 中引入 Tailwind：

```css
@import "tailwindcss";

/* 设计 Token（宪法原则 III：禁止内联魔法颜色值） */
@theme {
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-danger: #ef4444;
  --color-danger-hover: #dc2626;
  --color-warning: #f59e0b;
  --color-success: #22c55e;
  --color-surface: #f1f5f9;
  --color-surface-hover: #e2e8f0;
  --color-border: #e2e8f0;
  --font-mono: ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace;
}
```

---

## 第五步：配置 Vitest 覆盖率门禁

编辑 `vite.config.ts` 的 `test` 段（宪法原则 II）：

```typescript
test: {
  environment: 'happy-dom',
  coverage: {
    provider: 'v8',
    reporter: ['text', 'html', 'lcov'],
    exclude: ['src/main.ts', 'src/router/**', '**/*.d.ts'],
    thresholds: {
      statements: 80,
      functions: 80,
      branches: 80,
      lines: 80,
    },
  },
},
```

`src/api/` 目录 90% 覆盖率通过 CI 脚本单独检测，在 `package.json` 中添加：

```json
"scripts": {
  "test:api-coverage": "vitest run --coverage --reporter=json 2>&1 | node scripts/check-api-coverage.js"
}
```

---

## 第六步：初始化 MSW（集成测试 mock）

```bash
npx msw init public/ --save
```

创建 `tests/integration/handlers.ts`，定义 mock handler：

```typescript
import { http, HttpResponse } from 'msw'

const BASE = 'http://mock-agent:7070/api/v1'

export const handlers = [
  http.get(`${BASE}/health`, () => HttpResponse.json({ status: 'ok' })),
  http.get(`${BASE}/system/overview`, () =>
    HttpResponse.json({ /* SystemOverview fixture */ })
  ),
  // ... 其余端点 fixture
]
```

---

## 第七步：启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173`，进入设置页配置 agent 地址和 API Key。

---

## 常用开发命令

```bash
npm run dev          # 启动 Vite 开发服务器（HMR）
npm run build        # 生产构建（TypeScript 编译 + Vite 打包）
npm run preview      # 本地预览生产构建结果
npm run lint         # ESLint 检查（CI 阻止合并）
npm run type-check   # vue-tsc 类型检查（CI 阻止合并）
npm run test         # Vitest 单元/集成测试（含覆盖率）
npm run test:e2e     # Playwright E2E 测试
npm run test:e2e:ui  # Playwright UI 模式（可视化调试）
```

---

## CI 流水线（宪法原则 II，质量门禁）

四个阶段，任一失败阻止合并：

```
1. lint         → eslint + prettier --check
2. type-check   → vue-tsc --noEmit
3. test         → vitest run --coverage（覆盖率 ≥ 80%）
4. build        → vite build（Bundle 体积检查：gzip ≤ 300KB）
```

Bundle 体积检查脚本（`scripts/check-bundle-size.js`）在 `vite build` 后检查 `dist/assets/*.js` gzip 压缩后总大小，超出 300KB 时退出码 1（CI 失败）。

---

## 目录结构（初始化后参考）

```
src/
├── api/            # 创建 client.ts 及各模块 API 封装
├── components/
│   ├── common/     # ConfirmDialog.vue, SkeletonList.vue, EmptyState.vue
│   ├── agent/      # AgentSwitcher.vue, AgentCard.vue
│   └── layout/     # AppLayout.vue, Sidebar.vue
├── composables/    # usePolling.ts, useAgent.ts, useRole.ts, useConfirm.ts
├── pages/          # dashboard/, processes/, disks/, files/, shares/, network/, acl/, settings/
├── router/index.ts
├── stores/         # agents.ts, auth.ts, ui.ts
├── types/index.ts  # 对应 data-model.md 的 TypeScript 类型
├── utils/          # base64.ts, encoding.ts, constants.ts
└── main.ts
tests/
├── unit/
├── integration/    # MSW handlers + 各 API 模块集成测试
└── e2e/            # Playwright 场景（对应 7 个用户故事）
```

---

## 连接 mingyue-go agent（开发调试）

如果 agent 运行在不同机器（跨域），需在 Vite 开发服务器配置代理：

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://192.168.1.100:7070',  // 替换为实际 agent 地址
      changeOrigin: true,
      // 注意：开发代理仅用于本地调试，生产环境通过 nginx 反代处理 CORS
    },
  },
},
```

> 生产部署时，由 nginx 处理反向代理，无需 Vite 代理配置。
