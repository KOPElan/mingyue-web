# Phase 0 研究报告：mingyue-web 可视化管理界面

**日期**: 2026-03-30  
**分支**: `001-mingyue-web-ui`  
**研究员**: AI（基于公开文档、技术规格与实践经验）

---

## 研究议题索引

| # | 议题 | 状态 |
|---|------|------|
| R-01 | Vue 3 + Vite 6 项目初始化（TypeScript strict） | ✅ 已解决 |
| R-02 | Tailwind CSS v4 设计 Token 方案 | ✅ 已解决 |
| R-03 | Pinia 多 Agent 上下文隔离 | ✅ 已解决 |
| R-04 | VueUse 轮询节制（visibilityState 感知） | ✅ 已解决 |
| R-05 | @tanstack/vue-virtual 虚拟滚动 | ✅ 已解决 |
| R-06 | Vitest + Playwright 测试架构 | ✅ 已解决 |
| R-07 | localStorage API Key 安全性权衡 | ✅ 已解决 |
| R-08 | Base64 大文件编码内存限制 | ✅ 已解决 |
| R-09 | Axios 拦截器统一错误码映射 | ✅ 已解决 |
| R-10 | 骨架屏 vs Spinner 实现选型 | ✅ 已解决 |

---

## R-01：Vue 3 + Vite 6 项目初始化（TypeScript strict）

**决策**：使用 `npm create vue@latest`（官方 create-vue）脚手架，选择 TypeScript + Vue Router + Pinia + Vitest + Playwright 选项；`tsconfig.json` 手动确保 `"strict": true`。

**理由**：create-vue 是 Vue 官方推荐的脚手架工具，直接集成 Vite 6，生成最小化配置，无过度约束。相比 Nuxt 3（SSR 复杂度过高，本项目是纯 SPA）和 VueCLI（已废弃）更合适。

**关键配置**：
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

**替代方案放弃理由**：
- Nuxt 3：SSR 开销与本项目无益，纯 SPA 已满足需求
- Bun + Vite：Bun 生态尚不稳定，CI 兼容性风险高

---

## R-02：Tailwind CSS v4 设计 Token 方案

**决策**：使用 Tailwind CSS v4 的 CSS 变量原生 Design Token 方案——在 `src/assets/tokens.css` 中定义颜色、间距、字体 CSS 变量，并在 `tailwind.config.ts` 中通过 `theme.extend` 引用，所有组件通过语义化类名（如 `bg-primary`、`text-danger`）使用，禁止内联魔法颜色值。

**理由**：Tailwind v4 重构了配置体系，CSS 变量方案是其官方推荐路径，天然支持暗色模式（未来扩展）。相比 v3 的 `tailwind.config.js` hex 值方案，更易迁移和主题化。

**Token 分类**：
- 颜色：`--color-primary`、`--color-danger`、`--color-warning`、`--color-success`、`--color-surface`
- 间距：统一使用 Tailwind 内置 scale（4px 基准）
- 字体：`--font-sans`、`--font-mono`（文件内容展示）

**替代方案放弃理由**：
- CSS-in-JS（如 Element Plus token 系统）：与 Tailwind 原子类哲学冲突，且增加运行时开销
- 纯 UnoCSS：Tailwind v4 已满足需求，无需更换生态

---

## R-03：Pinia 多 Agent 上下文隔离

**决策**：使用单一 `agents` store 存储所有 agent 配置（`AgentConfig[]`），通过 `activeAgentId` 标记当前活跃 agent；所有 API 调用通过 `useAgent()` composable 读取当前 agent 的 `baseUrl` 和 `apiKey`，Axios 实例在切换 agent 时重建（更新 `baseURL` 和 `Authorization` header）。

**关键设计**：
```typescript
// stores/agents.ts
interface AgentConfig {
  id: string          // UUID
  label: string       // 用户自定义标签
  baseUrl: string     // http://<host>:7070
  apiKey: string      // Bearer Token（来自 localStorage）
  role?: 'viewer' | 'operator' | 'admin'  // 用户声明或推断
  online?: boolean    // GET /health 检测结果
}
```

**并发切换安全**：每次 API 请求携带发起时的 `agentId`；响应回调中检查 `activeAgentId === requestAgentId`，不匹配则丢弃响应（满足 Edge Case：并发切换场景）。

**替代方案放弃理由**：
- 每个 agent 独立 Pinia store 实例（`defineStore(agentId, ...)`）：在多 agent 场景下会产生不可控数量的 store，销毁时机复杂
- URL query 参数传递 agentId：URL 中暴露 agentId 无安全意义，且导航体验差

---

## R-04：VueUse 轮询节制（visibilityState 感知）

**决策**：使用 `@vueuse/core` 的 `useIntervalFn` + `useDocumentVisibility` 组合实现轮询节制。`useIntervalFn` 在标签页隐藏时自动暂停，可见后恢复，满足宪法原则 IV（轮询间隔 ≥ 5s，页面隐藏时暂停）。

**实现模式**：
```typescript
// composables/usePolling.ts
export function usePolling(fn: () => Promise<void>, intervalMs = 5000) {
  const visibility = useDocumentVisibility()
  const { pause, resume } = useIntervalFn(fn, intervalMs, { immediateCallback: true })
  watch(visibility, (v) => v === 'hidden' ? pause() : resume())
  return { pause, resume }
}
```

**替代方案放弃理由**：
- 手动 `setInterval` + `visibilitychange` 事件：需自行管理清理回调，在组件卸载时易产生内存泄漏
- WebSocket（agent 侧推送）：mingyue-go 当前 API 为 HTTP Pull，不支持 WS

---

## R-05：@tanstack/vue-virtual 虚拟滚动

**决策**：使用 `@tanstack/vue-virtual` 对进程列表（潜在 > 500 条）和文件列表（大目录）实现行虚拟化，满足宪法原则 IV（禁止单次渲染 > 500 DOM 节点）。

**替代方案比较**：

| 方案 | 包大小 | Vue 3 支持 | 行高动态 | 决策 |
|------|--------|----------|---------|------|
| @tanstack/vue-virtual | ~8KB | ✅ 官方 | ✅ | **选用** |
| vue-virtual-scroller | ~15KB | ✅ | ✅ | 放弃（体积较大） |
| 手动分页替代 | 0 | N/A | N/A | 对文件管理器不适用（用户期望连续滚动） |

**替代方案放弃理由**：分页方案对进程列表有效，但文件管理器目录导航期望连续滚动体验；虚拟滚动可兼顾两者。

---

## R-06：Vitest + Playwright 测试架构

**决策**：
- **单元/集成测试**：Vitest 3.x + `@vue/test-utils` 2.x，使用 `vitest coverage`（基于 v8）检测覆盖率；`src/api/` 层使用 `msw`（Mock Service Worker）模拟 mingyue-go agent 响应
- **E2E**：Playwright 1.x，测试文件置于 `tests/e2e/`；测试场景对应 7 个用户故事的 happy path + 所有危险操作确认流程

**覆盖率配置**：
```typescript
// vite.config.ts（Vitest 段）
coverage: {
  provider: 'v8',
  thresholds: {
    statements: 80,
    functions: 80,
    branches: 80,
    lines: 80
  },
  include: ['src/**'],
}
// src/api/ 目录单独设置 90% 门禁（通过 CI 脚本检查）
```

**MSW 策略**：在 `tests/integration/` 中使用 `setupServer` 拦截所有 `http://mock-agent:7070/api/v1/*` 请求，返回预定义 fixture，覆盖所有错误码（401、403、404、409、500）场景。

**替代方案放弃理由**：
- Jest + Vue Test Utils：Vitest 与 Vite 原生集成，速度快 3-5 倍，ESM 支持无需额外配置
- Cypress：Playwright 跨浏览器支持更优，API 更现代

---

## R-07：localStorage API Key 安全性权衡

**决策**：采用 `localStorage` 存储 API Key，首次写入前弹出"受信任设备确认"对话框（FR-001a）。这是用户明确选择的权衡（B 选项，问题 1 澄清记录）。

**安全缓解措施**（在无法使用后端代理的情况下）：
1. Key 存储在 `mingyue_agent_{id}_key` 这样的具名 key 下，不以明文前缀 "apikey" 存储
2. 读取时立即注入 Axios header，不在 Vue 响应式状态中长期持有
3. 组件开发者守则：禁止将 store 中的 `apiKey` 字段暴露给模板（`v-model`、`{{ }}`）
4. CSP 策略（nginx 层）：`Content-Security-Policy: default-src 'self'` 限制 XSS 影响面

**已知限制**：同源 XSS 仍可读取 localStorage。对家庭局域网 NAS 场景，攻击面极小，该风险由用户知情确认（FR-001a）承担。

**后续增强路径**：v2 提供 nginx 反代配置示例，Key 存储在服务端环境变量，前端完全不持有。

---

## R-08：Base64 大文件编码内存限制

**决策**：**v1 不实现文件上传**（已在 FR-016a 确认）。原因分析：

- `btoa()` 要求输入为 Latin-1 binary string，大文件需先用 `FileReader.readAsArrayBuffer()` 转换再手动 Base64 编码（`Uint8Array` → Base64）
- 1GB 文件：原始 1024MB → Base64 编码后 ~1365MB → JSON 包体 ~1365MB，浏览器无法在内存中处理
- `POST /files` API 无流式上传支持，整个 Base64 字符串需在单次请求体中发送

**占位 UI 策略**（FR-016a）：工具栏"上传文件"按钮保留，`disabled` 状态，`title` 属性显示"上传功能将在后续版本支持（需服务端 multipart 接口）"。

**未来实现路径**：mingyue-go 添加 `POST /files/upload`（multipart/form-data，流式写入），前端使用 `<input type="file">` + `fetch` streaming API，可支持 1GB+ 文件。

---

## R-09：Axios 拦截器统一错误码映射

**决策**：在 `src/api/client.ts` 中配置 Axios 响应拦截器，统一处理所有 API 错误，映射为中文用户提示并触发全局 UI 通知（`ui` store 的 `notify` action）。

**错误码映射表**：

| HTTP 状态 | agent 错误码 | 中文提示 | 行为 |
|-----------|-------------|---------|------|
| 401 | UNAUTHORIZED | "API Key 无效或已过期，请重新配置" | 跳转 /settings |
| 403 | FORBIDDEN | "当前角色权限不足，此操作需要 {role} 角色" | 显示通知，阻止操作 |
| 404 | NOT_FOUND | "资源不存在" | 显示通知 |
| 409 | CONFLICT | "操作冲突：{message}" | 显示通知，不跳转 |
| 5xx | INTERNAL | "服务器内部错误，请重试" | 显示通知 + 重试按钮 |
| 网络错误 | N/A | "无法连接到 agent，请检查网络或 agent 状态" | 显示通知 |
| 超时 | N/A | "连接超时（10s），请检查 agent 是否在线" | 显示通知 |

**替代方案放弃理由**：各组件自行处理错误会导致提示不一致，违反宪法原则 III（错误信息人性化）。

---

## R-10：骨架屏实现选型

**决策**：不引入额外骨架屏库，使用 Tailwind CSS `animate-pulse` 类 + 语义化占位 `div` 手动实现骨架屏组件（`SkeletonList`、`SkeletonCard`、`SkeletonTree`）。保持依赖树精简。

**实现模式**：
```vue
<!-- components/common/SkeletonList.vue -->
<template>
  <div v-for="n in rows" :key="n" class="animate-pulse h-10 bg-surface rounded mb-2" />
</template>
```

**空状态组件**：`EmptyState.vue`，接受 `icon`（SVG 组件）和 `message`（中文字符串）props，与骨架屏互斥显示（`v-if/v-else`）。

**替代方案放弃理由**：
- vue-skeleton-loader：额外 12KB，功能与 Tailwind animate-pulse 重复
- 居中 Spinner：用户澄清选择了骨架屏方案（A 选项，问题 4 澄清记录）

---

## 未解决项（Outstanding）

无。所有 `NEEDS CLARIFICATION` 已通过 speckit.clarify 会话解决（见 [spec.md 澄清记录章节](./spec.md)）。

## Phase 1 依赖项

以下研究结论将直接输入 Phase 1 设计：

- R-03 → `data-model.md`（AgentConfig 实体设计）
- R-01、R-02 → `quickstart.md`（项目初始化命令）
- R-09 → `contracts/api-client.md`（MingyueClient 接口契约）
- R-07 → `contracts/api-client.md`（安全注意事项章节）
