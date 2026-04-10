# mingyue-web 开发指引（Copilot Context）

自动生成自功能规划文档。最后更新：2026-03-30

## 当前技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| TypeScript | 5.x（`strict: true`） | 主开发语言 |
| Vue | 3.5+（Composition API + `<script setup>`） | UI 框架 |
| Vite | 6.x | 构建工具 |
| Tailwind CSS | v4 | 样式框架（CSS 变量 Design Token） |
| Pinia | 3.x | 状态管理（多 Agent 隔离） |
| Vue Router | 4 | 路由（路由级代码分割） |
| Axios | 1.x | HTTP 客户端（MingyueClient 封装） |
| VueUse | latest | Composables（轮询节制） |
| @tanstack/vue-virtual | latest | 虚拟滚动（大列表） |
| Vitest | 3.x | 单元/集成测试 |
| Playwright | 1.x | E2E 测试 |

## 项目结构

```text
src/
├── api/           # MingyueClient 封装（覆盖率要求 ≥ 90%）
├── components/    # common/、agent/、layout/
├── composables/   # usePolling, useAgent, useRole, useConfirm
├── pages/         # dashboard, processes, disks, files, shares, network, acl, settings
├── router/
├── stores/        # agents, auth, ui
├── types/         # TypeScript 类型（对应 data-model.md）
└── utils/         # base64, encoding, constants
tests/
├── unit/
├── integration/   # MSW mock agent
└── e2e/           # Playwright
```

## 开发命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 生产构建
npm run lint         # ESLint 检查
npm run type-check   # vue-tsc 类型检查
npm run test         # Vitest（含覆盖率门禁 ≥ 80%）
npm run test:e2e     # Playwright E2E
```

## 关键约束

- `src/api/` 层覆盖率 MUST ≥ 90%
- 禁止 `as any`；禁止 `test.skip` 进 main 分支
- 危险操作（终止进程/卸载磁盘/删除文件/down 网络接口）100% 需要确认对话框
- API Key 通过 localStorage 存储（首次受信任设备确认），禁止在 Vue 响应式状态中持有
- 文件读写必须通过 `utils/base64.ts` 的 `encodeBase64`/`decodeBase64`，不直接调用 `atob`/`btoa`
- 挂载路径删除必须 `encodeURIComponent()`（由 `MingyueClient.deleteMount` 内部处理）
- 列表加载：骨架屏（`animate-pulse`）；空数据：`EmptyState` 组件
- 初始 Bundle ≤ 300KB gzip（路由级代码分割）

## 规格文档

- [功能规格](../specs/001-mingyue-web-ui/spec.md)
- [实现规划](../specs/001-mingyue-web-ui/plan.md)
- [数据模型](../specs/001-mingyue-web-ui/data-model.md)
- [API 客户端契约](../specs/001-mingyue-web-ui/contracts/api-client.md)
- [快速上手](../specs/001-mingyue-web-ui/quickstart.md)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

