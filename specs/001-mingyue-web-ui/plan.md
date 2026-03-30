# 实现规划：mingyue-web 可视化管理界面

**分支（Branch）**: `001-mingyue-web-ui` | **日期（Date）**: 2026-03-30 | **规格（Spec）**: [spec.md](./spec.md)  
**输入（Input）**: Feature specification from `/specs/001-mingyue-web-ui/spec.md`  
**技术栈（Stack）**: Vue 3 + Vite + Tailwind CSS（用户指定）

## 总结（Summary）

构建 mingyue-web —— mingyue-go 的 Web 可视化管理界面。通过调用 mingyue-go 的 REST API（`http://<agent-host>:7070/api/v1`），为运维人员提供系统监控仪表板、进程管理、磁盘/挂载管理、浏览器文件管理器、Samba/NFS 共享管理、网络与 ACL 管理以及多 Agent 切换等功能。

技术方案：Vue 3（Composition API + `<script setup>`）+ Vite 6 + Tailwind CSS v4 + Pinia（状态管理）+ Vue Router 4 + Vitest（单元/集成测试）+ Playwright（E2E 测试）。

## 技术上下文（Technical Context）

**Language/Version**: TypeScript 5.x，`strict: true`（宪法原则 I）  
**Framework**: Vue 3.5+（Composition API，`<script setup>` 语法）  
**Build Tool**: Vite 6.x  
**Styling**: Tailwind CSS v4（CSS 变量 Design Token）  
**State Management**: Pinia 3.x（多 Agent 上下文隔离 store）  
**Routing**: Vue Router 4（路由级代码分割，满足宪法原则 IV Bundle ≤ 300KB）  
**HTTP Client**: Axios 1.x（封装 `MingyueClient`，含超时、错误码映射）  
**Utilities**: VueUse（`useDocumentVisibility`、`useIntervalFn` 用于轮询节制）  
**Virtual Scroll**: @tanstack/vue-virtual（大列表渲染，宪法原则 IV）  
**Testing**: Vitest 3.x（单元/集成）+ Playwright 1.x（E2E）  
**Target Platform**: 桌面浏览器（≥ 1024px），Chromium/Firefox/Safari  
**Project Type**: Web SPA（单页应用）  
**Performance Goals**: FCP ≤ 1.5s，TTI ≤ 3s，Bundle ≤ 300KB gzip（宪法原则 IV）  
**Constraints**: 纯前端 SPA（无自有后端），API Key 存 localStorage（首次受信任设备确认），CORS 由 nginx 反代处理  
**Scale/Scope**: 7 个功能模块，约 25–35 个页面/组件，支持同时连接多台 agent

## 宪法检查（Constitution Check）

*GATE：Phase 0 研究前通过此检查；Phase 1 设计完成后再次复查。*

| 宪法原则 | 适用检查项 | 状态 |
|----------|-----------|------|
| **I 代码质量** | TypeScript strict、ESLint + Prettier 配置、中文注释规范、常量集中管理（`constants.ts`）、组件 ≤ 300 行 | ✅ 规划中包含 |
| **II 测试优先 TDD** | Vitest 单元覆盖 ≥ 80%、`src/api/` 层 ≥ 90%；Playwright E2E 覆盖所有主流程和危险操作确认；禁止 `test.skip` 进主干 | ✅ 测试架构已规划 |
| **III UX 一致性** | Tailwind CSS 变量作为 Design Token、所有破坏性操作确认对话框（中文）、错误码中文映射、角色感知 UI、骨架屏加载（FR-025）、桌面端 ≥ 1024px | ✅ 规划中包含 |
| **IV 性能标准** | Vite 路由级代码分割（`defineAsyncComponent` / 动态 import）、@tanstack/vue-virtual 虚拟滚动、`useDocumentVisibility` 轮询暂停、CI 中 Bundle 体积检查 | ✅ 技术选型已确认 |
| **V 安全/最小权限** | localStorage + 受信任设备确认（FR-001a）、`atob`/`btoa` 封装（不裸用）、CIFS 提交后立即清 state、所有路径参数 `encodeURIComponent` | ✅ FR 已明确要求 |

**GATE 评估：通过，无违规，可进入 Phase 0。**

## 项目结构（Project Structure）

### 文档（本功能）

```text
specs/001-mingyue-web-ui/
├── plan.md          # 本文件
├── research.md      # Phase 0 产出
├── data-model.md    # Phase 1 产出
├── quickstart.md    # Phase 1 产出
├── contracts/       # Phase 1 产出
│   └── api-client.md
└── tasks.md         # Phase 2 产出（/speckit.tasks 命令）
```

### 源代码（仓库根目录）

```text
src/
├── api/                    # MingyueClient 封装层（API Key ≥ 90% 覆盖率）
│   ├── client.ts           # 基础 Axios 实例，Bearer Token 注入，错误映射
│   ├── system.ts           # GET /system/overview
│   ├── processes.ts        # GET/DELETE /processes
│   ├── disks.ts            # GET/POST/DELETE /disks/*
│   ├── files.ts            # GET/POST/PUT/DELETE /files（含 Base64 encode/decode）
│   ├── smb.ts              # GET/POST/PUT/DELETE /smb/shares, /smb/users
│   ├── nfs.ts              # GET/POST/PUT/DELETE /nfs/exports
│   ├── network.ts          # GET/PUT /network/interfaces
│   └── acl.ts              # GET/PUT /acl
├── components/             # 可复用 UI 组件
│   ├── common/             # ConfirmDialog, SkeletonList, EmptyState, StatusBadge
│   ├── agent/              # AgentSwitcher, AgentCard, AgentForm
│   └── layout/             # AppLayout, Sidebar, TopBar
├── composables/            # Vue Composables
│   ├── usePolling.ts       # 轮询管理（visibilityState 感知，≥ 5s 间隔）
│   ├── useAgent.ts         # 当前 agent 上下文（baseUrl + apiKey 隔离）
│   ├── useConfirm.ts       # 危险操作确认对话框 composable
│   └── useRole.ts          # 角色权限判断（viewer/operator/admin）
├── pages/                  # 路由页面（路由级动态 import）
│   ├── dashboard/          # 系统监控仪表板
│   ├── processes/          # 进程管理
│   ├── disks/              # 磁盘与挂载管理
│   ├── files/              # 文件管理器
│   ├── shares/             # Samba/NFS 共享管理
│   ├── network/            # 网络接口管理
│   ├── acl/                # ACL 管理
│   └── settings/           # 设置页（Agent 配置管理）
├── router/
│   └── index.ts            # Vue Router 4，所有页面动态 import
├── stores/                 # Pinia stores
│   ├── agents.ts           # 多 Agent 列表与活跃 agent
│   ├── auth.ts             # API Key 存取（localStorage + 受信任设备 flag）
│   └── ui.ts               # 全局 UI 状态（loading、通知）
├── types/                  # TypeScript 类型定义（对应 data-model.md）
│   └── index.ts
├── utils/
│   ├── base64.ts           # atob/btoa 安全封装
│   ├── encoding.ts         # encodeURIComponent 路径工具
│   └── constants.ts        # 全局常量（轮询间隔、文件大小限制等）
└── main.ts

tests/
├── unit/                   # Vitest 单元测试（*.test.ts）
├── integration/            # Vitest 集成测试，mock agent 响应（*.spec.ts）
└── e2e/                    # Playwright E2E（所有 US 主流程 + 确认对话框）

public/
index.html
vite.config.ts
tailwind.config.ts          # Design token CSS 变量定义
tsconfig.json               # strict: true
eslint.config.js
.prettierrc
```

**结构决策**：纯前端 SPA，单项目结构（无独立 backend）。路由层使用动态 import 实现代码分割；API 层独立目录并设覆盖率门禁；stores 按 agent/auth/ui 分层隔离。

## 复杂度追踪（Complexity Tracking）

> 无宪法违规，无需填写
