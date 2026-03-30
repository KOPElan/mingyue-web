<!--
同步影响报告（Sync Impact Report）
====================================
版本变更：（新建）→ 1.0.0
新增原则：5 条（代码质量、测试优先、UX一致性、性能标准、安全与权限最小化）
新增段落：API 集成规范、质量门禁与工作流、治理
变更原则：无（初次填写）
删除段落：无
模板同步状态：
  ✅ tasks-template.md — "Tests OPTIONAL" 说明已更新为宪法原则 II 强制要求
  ✅ plan-template.md — Constitution Check 门控已有具体指标来源（本文件），模板结构无需修改
  ✅ spec-template.md — 性能与 UX 要求通过宪法原则隐式约束，模板结构无需修改
  ✅ constitution-template.md — 仅作参考基础，未修改
延迟项：无，所有字段已填写完毕
-->

# mingyue-web 宪法（Constitution）

## 核心原则（Core Principles）

### I. 代码质量（不可妥协）

所有代码 MUST 满足以下基线标准，任何违反须在 PR 中明确记录理由并经过审查：

- **TypeScript 严格模式**：`tsconfig.json` 中 `"strict": true` MUST 启用；禁止出现 `as any`，显式 `any` 视为 lint 错误。
- **Lint 与格式化**：ESLint + Prettier 强制执行，CI 中 lint 失败则阻止合并。
- **注释规范**：所有公共组件、服务函数 MUST 附中文注释说明用途；英文变量/函数名可保留但 MUST 在注释中提供中文说明。
- **禁止魔法数字与死代码**：字面量常量 MUST 命名并集中管理（如 `constants.ts`）；未使用变量视为 lint 错误。
- **组件单一职责**：单个组件/函数行数 SHOULD ≤ 300 行；超限时 MUST 拆分子组件或提取 hook。
- **圈复杂度**：每个函数的圈复杂度（Cyclomatic Complexity）MUST ≤ 15；超出须拆分。

理由：系统管理类 UI 涉及宿主机敏感操作，代码可读性与可维护性直接影响运维安全。

### II. 测试优先（TDD，不可妥协）

所有面向用户的功能 MUST 遵循 TDD 循环（Red → Green → Refactor），禁止先实现后补测试：

- **单元测试覆盖率**：语句覆盖率 MUST ≥ 80%；API 调用封装层（`src/api/`）覆盖率 MUST ≥ 90%。
- **集成测试**：每个 mingyue-go API 端点的交互 MUST 有对应集成测试，使用 mock 响应模拟 agent 行为。
- **E2E 测试**：每个用户故事的主流程（happy path）MUST 有 E2E 场景覆盖；危险操作（终止进程、卸载磁盘）MUST 覆盖确认对话框流程。
- **测试文件命名**：`*.test.ts`（单元）/ `*.spec.ts`（集成/E2E），与源文件同目录或置于 `tests/` 下。
- **禁止跳过测试进入主干**：`test.skip`、`it.only`、`xit` MUST 不出现在 `main` 分支的提交中。

理由：mingyue-web 的操作直接作用于 Linux 宿主机，UI 缺陷可能导致数据丢失或服务中断，测试是安全网。

### III. 用户体验一致性（不可妥协）

所有页面和组件 MUST 遵循统一的交互与视觉规范：

- **设计 Token**：颜色、间距、字体大小 MUST 通过设计 token 引用（如 CSS 变量或主题配置）；禁止内联魔法颜色值（如 `color: #3b82f6`）。
- **危险操作确认**：删除、终止进程、卸载磁盘、DOWN 网络接口等破坏性操作 MUST 显示确认对话框，对话框文案 MUST 明确描述操作后果，且 MUST 为中文。
- **错误信息人性化**：API 错误码（如 `FORBIDDEN`、`NOT_FOUND`）MUST 转换为用户可读的中文提示；禁止将原始错误码直接暴露在 UI 中。
- **权限感知 UI**：按钮、菜单、操作项 MUST 根据当前 API Key 角色（`viewer`/`operator`/`admin`）动态启用或禁用；不可见依赖后端拒绝来防止越权操作。
- **加载状态**：所有异步请求 MUST 显示加载指示器；预计超过 300ms 的操作 MUST 使用 skeleton 或 spinner，避免界面"假死"。
- **响应式布局**：桌面端（≥ 1024px 宽）为最低支持要求，MUST 正常使用；布局不得在此宽度以上出现横向滚动条。

理由：管理界面用于操控生产环境主机，操作失误成本高，清晰一致的交互反馈是防误操作的核心手段。

### IV. 性能标准

以下指标 MUST 在 localhost 开发环境达标，生产环境（通过反向代理访问 agent）SHOULD 不低于此基准：

- **首次内容渲染（FCP）**：MUST ≤ 1.5s（localhost，冷启动）。
- **可交互时间（TTI）**：MUST ≤ 3s（localhost）。
- **初始 JS Bundle 体积**：gzip 后 MUST ≤ 300KB；路由级代码分割（Code Splitting）MUST 实现，非首屏页面按需加载。
- **大列表渲染**：进程列表、文件列表等条目数可能超过 200 条的 UI MUST 实现虚拟滚动或分页，禁止单次渲染 > 500 个 DOM 节点。
- **API 轮询节制**：健康检查等轮询间隔 MUST ≥ 5s；当 `document.visibilityState === 'hidden'` 时 MUST 暂停轮询，可见后恢复。
- **监控数据刷新**：系统概览、磁盘状态等实时数据更新频率 SHOULD ≤ 5s 一次，避免频繁重绘导致卡顿。

理由：Web UI 通常同时连接多台 agent，频繁 API 请求和大量 DOM 渲染会降低管理体验；宿主机资源本已受监控，不应因 UI 本身增加不必要负载。

### V. 安全与权限最小化（不可妥协）

所有涉及 API Key、用户凭据和路径参数的代码 MUST 满足以下安全要求：

- **API Key 存储禁忌**：MUST 不硬编码在源码中；MUST 不存入 `localStorage` 或 `sessionStorage`（XSS 暴露面）；推荐通过后端代理转发，前端不直接持有 key。
- **文件内容 Base64 处理**：`GET /files/read` 响应的 `content` 字段 MUST 用 `atob()` 解码；`POST /files` 请求 `content` 字段 MUST 用 `btoa()` 编码；禁止原始二进制数据传入 JSON。
- **CIFS 凭据生命周期**：挂载 CIFS 时的 `username`/`password` MUST 在请求完成后立即清除组件状态，MUST 不持久化到任何存储中。
- **路径参数编码**：所有用户输入或动态拼接的 URL 路径参数（含挂载点、文件路径）MUST 经 `encodeURIComponent()` 处理后再拼入请求 URL。
- **日志与控制台安全**：MUST 禁止通过 `console.log` 输出 API Key、密码或完整的 Authorization 请求头内容。

理由：Web UI 直接操控 Linux 宿主机，一旦 API Key 泄露即等同于宿主机 shell 访问权限；前端安全是整体安全链的入口。

## API 集成规范

所有调用 mingyue-go 后端 API 的代码 MUST 遵守以下约定，确保错误处理一致、编码规范统一：

- **统一客户端封装**：所有 API 调用 MUST 通过封装好的客户端类（参考 `MingyueClient` TypeScript 示例）发出，禁止在组件中直接使用裸 `fetch`。
- **错误码映射**：
  - `401 UNAUTHORIZED` → 跳转至 agent 配置页并提示"API Key 无效或已过期，请重新配置"。
  - `403 FORBIDDEN` → 显示权限不足提示，说明所需角色（如"此操作需要 admin 角色"）。
  - `404 NOT_FOUND` → 显示"资源不存在"，并根据场景提供导航建议。
  - `409 CONFLICT` → 显示具体冲突原因（如"挂载点已存在"）。
  - `5xx INTERNAL` → 显示"服务器内部错误"，提供重试按钮，并在开发模式下展示详细错误信息。
- **多 Agent 隔离**：每台宿主机的 `baseUrl` 和 `apiKey` MUST 独立管理，不同 agent 的请求上下文 MUST 不混用。
- **请求超时**：所有 API 请求 MUST 设置超时（建议 10s），超时后显示"连接超时，请检查 agent 是否在线"。

## 质量门禁与工作流

以下流程约束适用于所有功能开发：

- **PR 内容要求**：每个 PR MUST 包含：① 功能描述（中文）② 测试覆盖情况说明 ③ UI 变更须附截图或操作录屏。
- **CI 流水线**：`lint → type-check → unit test → build` 四个阶段，任一失败 MUST 阻止合并。覆盖率低于阈值亦视为失败。
- **破坏性操作审查**：涉及进程终止、磁盘卸载、网络接口变更的 UI 实现 MUST 经过第二人审查（或自审时留下明确的安全性分析注释）。
- **CHANGELOG 维护**：每次版本发布（tag）MUST 在 `CHANGELOG.md` 中记录变更内容，采用 Keep a Changelog 格式，语言为中文。

## 治理（Governance）

本宪法优先级高于任何个人习惯、框架默认值或第三方工具推荐：

- **修订程序**：原则的新增、修改或删除 MUST 通过独立 PR 进行，PR 描述 MUST 说明变更动机、影响范围，以及是否需要迁移现有代码。
- **版本语义**：
  - `MAJOR`：移除或重新定义已有原则（向后不兼容的治理变更）。
  - `MINOR`：新增原则或章节，或对现有原则进行实质性扩展。
  - `PATCH`：措辞澄清、格式修正、错别字修正，不改变语义。
- **合规审查**：每季度（或每 10 个 PR 合并后）开展一次宪法合规回顾，检验实际代码是否符合各原则要求，结果记录在 `docs/compliance-review/` 目录下。
- **例外处理**：确有技术原因无法遵守某原则时，MUST 在代码注释中标注 `// [宪法例外]`，说明原因，并在对应 PR 中记录。例外不得累积超过 3 个未解决条目，否则须优先解决再推进新功能。

**版本（Version）**: 1.0.0 | **批准日期（Ratified）**: 2026-03-30 | **最后修订（Last Amended）**: 2026-03-30
