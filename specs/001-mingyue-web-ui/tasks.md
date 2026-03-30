# Tasks: mingyue-web 可视化管理界面

**功能分支（Branch）**: `001-mingyue-web-ui`  
**生成日期（Generated）**: 2026-03-30  
**来源规格（Spec）**: [spec.md](./spec.md)  
**来源规划（Plan）**: [plan.md](./plan.md)

## 输入文档（Input Documents）

- ✅ **spec.md** — 7 个用户故事（P1–P7），FR-001~FR-026，SC-001~SC-008，4 条澄清记录
- ✅ **plan.md** — 技术栈（Vue 3.5+/Vite 6/Tailwind v4/Pinia/Vue Router 4/Vitest/Playwright）
- ✅ **data-model.md** — 14 个 TypeScript 实体定义
- ✅ **contracts/api-client.md** — MingyueClient 完整接口契约
- ✅ **research.md** — 10 项技术决策全部解决
- ✅ **quickstart.md** — 7 步开发环境搭建指南

## 测试约定（Constitutional Principle II：MANDATORY）

> 测试任务 **MUST** 先于对应实现任务。所有阶段均需包含测试任务。
> - **Vitest 覆盖率门禁**：全局 ≥ 80%，`src/api/` 层 ≥ 90%
> - **Playwright E2E**：覆盖所有 7 个用户故事主流程 + 全部危险操作确认对话框
> - **禁止** `test.skip` 进主干分支

---

## Phase 1：项目初始化与环境搭建

**目标**：从零建立 Vue 3 + Vite + Tailwind CSS v4 + TypeScript strict 项目骨架，配置测试框架和 CI 工具链。

**独立验证**：`npm run dev` 可启动，`npm run test` 覆盖率命令可运行（无实际测试也应输出 0%），`npm run build` 无报错。

- [ ] T001 使用 `npm create vue@latest` 初始化项目（选择 TypeScript、Vue Router、Pinia、ESLint），并提交初始结构
- [ ] T002 [P] 配置 tsconfig.json：`strict: true`，`paths` 别名 `@/` → `src/`，`moduleResolution: bundler`
- [ ] T003 [P] 安装并配置 Tailwind CSS v4，在 tailwind.config.ts 中定义 Design Token CSS 变量（颜色、字体、间距）
- [ ] T004 [P] 安装运行时依赖：`axios`、`@vueuse/core`、`@tanstack/vue-virtual`
- [ ] T005 [P] 安装开发依赖：`vitest`、`@vitest/coverage-v8`、`@vue/test-utils`、`msw`、`@playwright/test`
- [ ] T006 [P] 配置 ESLint（eslint.config.js）和 Prettier（.prettierrc），强制中文注释关键路径规范
- [ ] T007 [P] 配置 vite.config.ts：路由级代码分割、build rollupOptions、`@` 别名
- [ ] T008 [P] 配置 Vitest 覆盖率门禁：全局 `branches/functions/lines ≥ 80%`，`src/api/**` ≥ 90% 在 vite.config.ts 中
- [ ] T009 [P] 创建 Bundle 体积检查脚本 scripts/check-bundle-size.js（gzip 后 ≤ 300KB 否则 exit 1）
- [ ] T010 [P] 配置 Playwright：playwright.config.ts（baseURL、浏览器矩阵 Chromium/Firefox/WebKit）
- [ ] T011 [P] 初始化 MSW ServiceWorker：运行 `npx msw init public/`，生成 `public/mockServiceWorker.js`
- [ ] T012 [P] 创建 src/ 完整目录骨架（api/, components/common|agent|layout/, composables/, pages/所有子目录, router/, stores/, types/, utils/）

**Checkpoint**：`npm run dev`、`npm run build`、`npm run test --run` 均无报错。

---

## Phase 2：基础设施（Foundational）

**目标**：建立所有用户故事共用的核心层：类型定义、API 客户端、Pinia Stores、路由、公共组件、Composables。

**独立验证**：`npm run test` 通过基础设施单元测试；路由导航不报错；`ConfirmDialog`、`SkeletonList`、`EmptyState` 可在 Storybook 或独立页面渲染。

> 此阶段是所有用户故事的阻断前置项（BLOCKS all user stories）。

### 基础设施测试（宪法原则 II：MANDATORY，先于实现）

- [ ] T013 [P] 创建 MSW API 模拟处理器（health、system、processes、disks、files、smb、nfs、network、acl 全部端点）在 tests/mocks/handlers.ts
- [ ] T014 [P] 编写 src/utils/base64.ts 的单元测试（encodeBase64/decodeBase64 正确性、空字符串、边界值）在 tests/unit/base64.test.ts
- [ ] T015 [P] 编写 src/utils/encoding.ts 的单元测试（encodeMountPath 路径含空格/斜杠/中文）在 tests/unit/encoding.test.ts
- [ ] T016 [P] 编写 src/api/client.ts 的单元测试（Bearer Token 注入、6 种错误码中文映射、MingyueApiError 实例化）在 tests/unit/api-client.test.ts

### 基础设施实现

- [ ] T017 [P] 定义所有 14 个 TypeScript 实体类型（AgentConfig、SystemOverview、Process、DiskDevice、MountPoint、SmartHealth、FileEntry、FileContent、WriteFileRequest、SmbShare、SmbUser、NfsExport、NetworkInterface、AclInfo/AclEntry）在 src/types/index.ts
- [ ] T018 [P] 创建 src/utils/base64.ts：`encodeBase64(text: string): string`（btoa 安全封装）和 `decodeBase64(encoded: string): string`（atob 安全封装）
- [ ] T019 [P] 创建 src/utils/encoding.ts：`encodeMountPath(path: string): string`（encodeURIComponent 路径工具）
- [ ] T020 [P] 创建 src/utils/constants.ts：轮询间隔（POLLING_INTERVAL = 5000）、文件预览大小限制（FILE_PREVIEW_LIMIT = 1MB）、ACL 格式正则、错误码→中文消息映射
- [ ] T021 创建 src/api/client.ts：Axios 基础实例工厂 `createMingyueClient(baseUrl, apiKey)`，Bearer Token 拦截器，响应错误拦截器（UNAUTHORIZED/FORBIDDEN/NOT_FOUND/INVALID_INPUT/CONFLICT/INTERNAL → MingyueApiError），MingyueApiError 类定义
- [ ] T022 [P] 创建 src/stores/agents.ts：Pinia store，字段：agents 列表、activeAgentId、健康状态 map，Actions：addAgent、removeAgent、setActiveAgent、updateHealthStatus
- [ ] T023 [P] 创建 src/stores/auth.ts：Pinia store，Actions：saveApiKey（含受信任设备 flag 写 localStorage）、loadApiKey、clearApiKey、isTrustedDevice 判断
- [ ] T024 [P] 创建 src/stores/ui.ts：Pinia store，字段：globalLoading、toast 通知队列，Actions：showToast、hideToast（success/error/warn 三种类型）
- [ ] T025 配置 src/router/index.ts：8 个页面路由（settings、dashboard、processes、disks、files、shares、network、acl），全部使用 `() => import()` 动态懒加载，未配置 agent 时重定向到 settings
- [ ] T026 [P] 创建 src/components/common/ConfirmDialog.vue：可复用确认模态框（title、message、confirmText、cancelText props，confirm/cancel emits，Escape 键关闭，Enter 键确认）
- [ ] T027 [P] 创建 src/components/common/SkeletonList.vue：骨架屏占位（rows prop，支持单行和多列变体）
- [ ] T028 [P] 创建 src/components/common/EmptyState.vue：空状态组件（icon slot、中文描述 message prop、action slot）
- [ ] T029 [P] 创建 src/components/common/StatusBadge.vue：状态标签（`online`/`offline`/`warning`/`error` 变体，对应中文文案）
- [ ] T030 [P] 创建 src/components/layout/AppLayout.vue：主布局（Sidebar + TopBar + 内容区 router-view）
- [ ] T031 [P] 创建 src/components/layout/Sidebar.vue：侧边导航（仪表板/进程/磁盘/文件/共享/网络/ACL/设置，角色感知菜单项禁用）
- [ ] T032 [P] 创建 src/components/layout/TopBar.vue：顶部栏（agent 切换器占位、全局 loading 指示器）
- [ ] T033 [P] 创建 src/composables/usePolling.ts：基于 `useDocumentVisibility` + `useIntervalFn`（VueUse），标签页不可见时暂停，返回 `{ start, stop, isPolling }`
- [ ] T034 [P] 创建 src/composables/useAgent.ts：从 activeAgent store 获取当前 `{ baseUrl, apiKey }`，并创建 MingyueClient 实例
- [ ] T035 [P] 创建 src/composables/useConfirm.ts：调用 ConfirmDialog 的 Composable，返回 Promise-based `confirm(options)` 方法
- [ ] T036 [P] 创建 src/composables/useRole.ts：从 activeAgent 的 API Key 角色推断，返回 `{ isViewer, isOperator, isAdmin, canWrite, canManageNetwork }`
- [ ] T037 配置 src/main.ts：创建 Vue app，注册 Pinia、Vue Router，挂载 `#app`

**Checkpoint**：`npm run test` 通过 T014~T016 的单元测试；路由从 `/` 可跳转到所有已创建的空页面；公共组件可正常渲染。

---

## Phase 3：用户故事 1 — Agent 连接配置与系统监控仪表板（优先级：P1）

**目标**：实现设置页 Agent 配置（含受信任设备确认）、仪表板实时数据展示、5 秒轮询（页面不可见时暂停）。

**独立验证**：可配置 agent 地址和 API Key，看到 CPU/内存/磁盘/运行时间数据，关闭/恢复标签后轮询正确暂停/恢复。

### 用户故事 1 测试（宪法原则 II：MANDATORY，先于实现）

- [ ] T038 [P] [US1] 编写集成测试：首次保存 API Key 时触发受信任设备确认弹框流程 在 tests/integration/settings.spec.ts
- [ ] T039 [P] [US1] 编写集成测试：仪表板页面加载后 usePolling 以 5s 间隔轮询，标签不可见时暂停 在 tests/integration/dashboard.spec.ts
- [ ] T040 [P] [US1] 编写单元测试：src/api/system.ts getSystemOverview 请求路径、响应类型映射 在 tests/unit/api-system.test.ts
- [ ] T041 [P] [US1] 编写 E2E 测试：填写 agent 地址→受信任确认→点击连接→跳转仪表板并显示数据 在 tests/e2e/us1-dashboard.spec.ts

### 用户故事 1 实现

- [ ] T042 [US1] 创建 src/api/system.ts：`getSystemOverview(client): Promise<SystemOverview>`（GET /system/overview），`checkHealth(baseUrl): Promise<boolean>`（GET /health，无 Token）
- [ ] T043 [P] [US1] 创建 src/pages/settings/SettingsPage.vue：单 Agent 配置页布局，引入 AgentForm，成功连接后 router.push('/dashboard')
- [ ] T044 [US1] 创建 src/components/agent/AgentForm.vue：地址输入框 + API Key 密码框 + "受信任设备确认" ConfirmDialog（含风险说明文案），调用 auth store 的 saveApiKey
- [ ] T045 [US1] 创建 src/pages/dashboard/DashboardPage.vue：四卡片布局，onMounted 初始加载，usePolling（5s）驱动数据刷新，连接失败显示中文错误提示
- [ ] T046 [P] [US1] 创建 src/pages/dashboard/CpuCard.vue：展示 CPU 使用率百分比 + 进度条，加载中显示 SkeletonList
- [ ] T047 [P] [US1] 创建 src/pages/dashboard/MemoryCard.vue：展示内存已用/总量/使用率，加载中显示 SkeletonList
- [ ] T048 [P] [US1] 创建 src/pages/dashboard/UptimeCard.vue：展示系统运行时间（自动格式化为天/时/分），加载中显示 SkeletonList
- [ ] T049 [P] [US1] 创建 src/pages/dashboard/DiskUsageCard.vue：展示磁盘整体使用情况概览，加载中显示 SkeletonList
- [ ] T050 [US1] 在 DashboardPage 中连接 usePolling（interval=5000, 使用 useDocumentVisibility 自动暂停），useRole 驱动写操作入口的禁用状态
- [ ] T051 [US1] 实现连接失败中文错误处理：agent 不可达显示"无法连接到 agent，请检查地址或服务状态"；401 跳转 settings；403 显示权限提示

**Checkpoint（MVP）**：至此 US1 可独立交付 demo：设置页配置 → 仪表板显示实时数据 → viewer 角色所有写操作按钮禁用。

---

## Phase 4：用户故事 2 — 进程管理（优先级：P2）

**目标**：实现进程列表（客户端过滤、分页）+ 终止进程（角色守卫 + 确认对话框）+ 终止后自动刷新。

**独立验证**：进程列表加载、搜索过滤无结果时显示空状态；`operator`/`admin` 可终止，`viewer` 按钮禁用。

### 用户故事 2 测试（宪法原则 II：MANDATORY，先于实现）

- [ ] T052 [P] [US2] 编写集成测试：一次性加载进程列表，搜索关键词实时过滤（无额外 API 请求），无结果时空状态 在 tests/integration/processes.spec.ts
- [ ] T053 [P] [US2] 编写集成测试：viewer 角色终止按钮禁用；operator 角色点击弹出确认对话框并执行 DELETE 在 tests/integration/processes.spec.ts
- [ ] T054 [P] [US2] 编写 E2E 测试：搜索进程→以 operator 角色终止→确认→列表刷新移除已终止进程 在 tests/e2e/us2-processes.spec.ts

### 用户故事 2 实现

- [ ] T055 [US2] 创建 src/api/processes.ts：`listProcesses(client): Promise<Process[]>`（GET /processes），`killProcess(client, pid): Promise<void>`（DELETE /processes/{pid}）
- [ ] T056 [P] [US2] 创建 src/pages/processes/ProcessesPage.vue：布局（搜索栏 + ProcessTable），onMounted 加载全量进程，终止后触发 2s 内刷新
- [ ] T057 [US2] 在 ProcessesPage 中实现客户端过滤：`computed filteredProcesses` 基于 searchKeyword 过滤 name/command，不触发额外 API 请求
- [ ] T058 [US2] 在 ProcessesPage 中实现终止进程：调用 useConfirm（"确认终止进程 [name]（PID: [pid]）？此操作不可撤销。"），确认后 callAPI，成功后刷新列表
- [ ] T059 [P] [US2] 创建 src/pages/processes/ProcessTable.vue：使用 `@tanstack/vue-virtual` 虚拟滚动，列：PID、进程名、状态、CPU%、内存 RSS、用户名、操作；useRole 控制终止按钮禁用（viewer 鼠标悬停提示"需要 operator 或 admin 角色"）
- [ ] T060 [P] [US2] 在 ProcessesPage 中实现分页逻辑：默认每页 20 条，支持切换每页数量，无结果时显示 EmptyState（"未找到匹配的进程"）

**Checkpoint**：US1 + US2 均可独立工作，进程列表功能完整。

---

## Phase 5：用户故事 3 — 磁盘与挂载管理（优先级：P3）

**目标**：块设备列表、挂载点管理（本地/CIFS/NFS）、SMART 健康展示、卸载路径 URL 编码、CIFS 凭据安全清除。

**独立验证**：新建挂载（三种类型）→ 列表更新；CIFS 密码提交后 devtools 无凭据残留；卸载请求 URL 正确编码。

### 用户故事 3 测试（宪法原则 II：MANDATORY，先于实现）

- [ ] T061 [P] [US3] 编写集成测试：加载块设备列表和挂载点列表，切换标签页正常显示 在 tests/integration/disks.spec.ts
- [ ] T062 [P] [US3] 编写集成测试：新建本地/CIFS/NFS 挂载请求体格式；卸载请求 URL 中挂载路径含特殊字符时正确编码 在 tests/integration/disks.spec.ts
- [ ] T063 [P] [US3] 编写集成测试：CIFS 挂载提交后组件 data 中 password 字段立即清除（为空字符串） 在 tests/integration/disks.spec.ts
- [ ] T064 [P] [US3] 编写 E2E 测试：查看磁盘→新建 CIFS 挂载→确认→列表更新；点击卸载→确认→挂载消失 在 tests/e2e/us3-disks.spec.ts

### 用户故事 3 实现

- [ ] T065 [US3] 创建 src/api/disks.ts：`listDevices`（GET /disks/devices）、`listMounts`（GET /disks/mounts）、`createMount`（POST /disks/mounts）、`deleteMount`（DELETE /disks/mounts/{encodeMountPath(path)}）、`getSmartHealth`（GET /disks/{device}/smart）、`getPowerState`（GET /disks/{device}/power）
- [ ] T066 [P] [US3] 创建 src/pages/disks/DisksPage.vue：两标签布局（"块设备" + "挂载点"），各标签独立加载，加载中显示 SkeletonList
- [ ] T067 [P] [US3] 创建 src/pages/disks/DiskDeviceList.vue：设备名、大小、类型、型号列表，含"SMART 健康"按钮（展开 SmartHealthPanel）
- [ ] T068 [P] [US3] 创建 src/pages/disks/MountPointList.vue：设备路径、挂载目标、文件系统类型列表，含"卸载"按钮（调用 useConfirm）
- [ ] T069 [US3] 创建 src/pages/disks/MountForm.vue：挂载类型选择（本地/CIFS/NFS），CIFS 密码字段 `type="password"`，表单提交后在 `@submit` 回调中立即执行 `cisfsPassword = ''` 清除凭据，组件不持久化密码
- [ ] T070 [P] [US3] 创建 src/pages/disks/SmartHealthPanel.vue：健康状态（健康/警告/危险）、温度、通电时间；API 返回 404 或未安装 smartmontools 时展示降级提示"设备未支持 SMART 查询"，不报错

**Checkpoint**：US1 + US2 + US3 均可独立工作，磁盘管理功能完整；CIFS 凭据安全验证通过。

---

## Phase 6：用户故事 4 — 浏览器文件管理器（优先级：P4）

**目标**：目录树 + 文件列表双栏布局，文本文件预览（≤1MB，atob 解码），写入（btoa 编码），删除确认（递归警告），上传占位 UI。

**独立验证**：浏览目录树、预览文本文件内容正确解码、1MB+ 文件显示下载提示、删除确认含递归删除警告。

### 用户故事 4 测试（宪法原则 II：MANDATORY，先于实现）

- [ ] T071 [P] [US4] 编写集成测试：目录树从 `/` 展开，点击目录更新文件列表（文件名、大小、修改时间、权限） 在 tests/integration/files.spec.ts
- [ ] T072 [P] [US4] 编写集成测试：读取文件 API 返回 base64 内容，FileViewer 使用 decodeBase64 正确解码；写入时调用 encodeBase64 编码内容后发送 POST 在 tests/integration/files.spec.ts
- [ ] T073 [P] [US4] 编写集成测试：删除文件/目录调用 useConfirm，确认文本含"递归删除"警告 在 tests/integration/files.spec.ts
- [ ] T074 [P] [US4] 编写 E2E 测试：浏览目录树→选择文本文件→预览内容→编辑→保存→显示"保存成功"提示 在 tests/e2e/us4-files.spec.ts

### 用户故事 4 实现

- [ ] T075 [US4] 创建 src/api/files.ts：`listFiles`（GET /files?path=）、`statFile`（GET /files/stat?path=）、`readFile`（GET /files/read?path= + decodeBase64）、`writeFile`（POST /files + encodeBase64）、`moveFile`（PUT /files/move）、`copyFile`（PUT /files/copy）、`deleteFile`（DELETE /files）
- [ ] T076 [P] [US4] 创建 src/pages/files/FilesPage.vue：左右双栏 `<resizable-layout>`，左侧 DirectoryTree，右侧 FileList + FileViewer，加载中各区域独立显示 SkeletonList
- [ ] T077 [P] [US4] 创建 src/pages/files/DirectoryTree.vue：递归展开目录树，从 `/` 开始，点击展开/折叠，当前选中路径高亮
- [ ] T078 [P] [US4] 创建 src/pages/files/FileList.vue：名称、类型（图标区分 file/dir/symlink）、大小（格式化）、修改时间、权限位，点击文件触发 `select` emit
- [ ] T079 [US4] 创建 src/pages/files/FileViewer.vue：文件大小 ≤ 1MB 时调用 readFile + decodeBase64 展示文本，支持编辑；> 1MB 时显示"文件过大，仅支持下载"并提供下载链接
- [ ] T080 [US4] 在 FileViewer 中实现文件保存：内容 encodeBase64 后调用 writeFile，成功显示 ui store 的 success toast，失败显示 error toast
- [ ] T081 [US4] 在 FilesPage 中实现拖拽移动：监听 dragstart/drop 事件，源路径 ≠ 目标路径时调用 moveFile，操作完成后刷新目录树和文件列表
- [ ] T082 [P] [US4] 在 FilesPage 中实现删除操作：调用 useConfirm（"确认删除 [path]？目录删除将递归删除所有内容，不可恢复。"），确认后调用 deleteFile
- [ ] T083 [P] [US4] 在 FilesPage 工具栏添加"上传文件"占位按钮（`disabled`，`title="上传功能将在后续版本支持（需服务端 multipart 接口）"`）

**Checkpoint**：US1~US4 均可独立工作，文件管理器功能完整；Base64 编解码验证通过。

---

## Phase 7：用户故事 5 — 共享管理（Samba/NFS）（优先级：P5）

**目标**：Samba 共享 + NFS 导出 CRUD，Samba 用户管理（密码全程掩码，不回显）。

**独立验证**：创建/编辑/删除 SMB 共享和 NFS 导出；创建 Samba 用户后密码在 UI 和 devtools 中不可见。

### 用户故事 5 测试（宪法原则 II：MANDATORY，先于实现）

- [ ] T084 [P] [US5] 编写集成测试：Samba 共享 CRUD（创建/更新/删除），CONFLICT 错误显示中文"共享名称已存在" 在 tests/integration/smb.spec.ts
- [ ] T085 [P] [US5] 编写集成测试：NFS 导出 CRUD（创建/更新/删除） 在 tests/integration/nfs.spec.ts
- [ ] T086 [P] [US5] 编写集成测试：Samba 用户创建和修改密码，密码 input `type="password"` 且不出现在请求 log 中 在 tests/integration/smb-users.spec.ts
- [ ] T087 [P] [US5] 编写 E2E 测试：创建 SMB 共享→验证列表更新；创建 NFS 导出→删除→确认对话 在 tests/e2e/us5-shares.spec.ts

### 用户故事 5 实现

- [ ] T088 [US5] 创建 src/api/smb.ts：`listShares`、`createShare`（POST /smb/shares）、`updateShare`（PUT /smb/shares/{name}）、`deleteShare`（DELETE /smb/shares/{name}）、`listUsers`（GET /smb/users）、`createUser`（POST /smb/users）、`updateUserPassword`（PUT /smb/users/{username}/password）、`deleteUser`（DELETE /smb/users/{username}）
- [ ] T089 [P] [US5] 创建 src/api/nfs.ts：`listExports`、`createExport`（POST /nfs/exports）、`updateExport`（PUT /nfs/exports/{name}）、`deleteExport`（DELETE /nfs/exports/{name}）
- [ ] T090 [P] [US5] 创建 src/pages/shares/SharesPage.vue：SMB/NFS 两标签布局，各自独立加载，加载中显示 SkeletonList，空时显示 EmptyState
- [ ] T091 [P] [US5] 创建 src/pages/shares/SmbShareList.vue：名称、路径、启用状态（StatusBadge）、只读/读写标记，含编辑/删除 action
- [ ] T092 [P] [US5] 创建 src/pages/shares/NfsExportList.vue：导出名称、路径、客户端配置、启用状态，含编辑/删除 action
- [ ] T093 [US5] 创建 src/pages/shares/ShareForm.vue：SMB/NFS 共享创建/编辑表单（name、path、只读、允许客户端等），CONFLICT 错误在表单内联显示"共享名称已存在（CONFLICT）"
- [ ] T094 [P] [US5] 创建 src/pages/shares/SmbUserManager.vue：用户列表、创建用户（username + password `type="password"`）、修改密码，密码字段不回显，提交后清除密码 state

**Checkpoint**：US1~US5 均可独立工作，共享管理功能完整。

---

## Phase 8：用户故事 6 — 网络接口管理与 ACL 管理（优先级：P6）

**目标**：网络接口状态展示、admin 专属 up/down/dhcp（含中断风险确认）、POSIX ACL 查询与设置（含前端格式校验）。

**独立验证**：非 admin 角色 network 操作按钮禁用；admin 操作弹出含"可能断开连接"警告的确认框；ACL 条目格式错误前端即时提示。

### 用户故事 6 测试（宪法原则 II：MANDATORY，先于实现）

- [ ] T095 [P] [US6] 编写集成测试：网络接口列表加载，接口卡片显示名称/MAC/IP/MTU/状态 在 tests/integration/network.spec.ts
- [ ] T096 [P] [US6] 编写集成测试：viewer/operator 角色 up/down/dhcp 按钮禁用；admin 角色点击触发 ConfirmDialog 且确认文本含"可能导致当前连接中断" 在 tests/integration/network.spec.ts
- [ ] T097 [P] [US6] 编写单元测试：ACL 条目格式正则 `^[ugom]:[^:]*:[rwx-]{3}$`，正例/反例全覆盖 在 tests/unit/acl-validation.test.ts
- [ ] T098 [P] [US6] 编写集成测试：ACL 查询（GET /acl?path=）和设置（PUT /acl），getfacl 无结果时显示空列表附注说明 在 tests/integration/acl.spec.ts
- [ ] T099 [P] [US6] 编写 E2E 测试：以 admin 角色查看网络接口→尝试 down 操作→确认→收到操作结果提示 在 tests/e2e/us6-network-acl.spec.ts

### 用户故事 6 实现

- [ ] T100 [US6] 创建 src/api/network.ts：`listInterfaces`（GET /network/interfaces）、`getInterface`（GET /network/interfaces/{name}）、`updateInterface`（PUT /network/interfaces/{name}，传 action: up/down/dhcp）
- [ ] T101 [P] [US6] 创建 src/api/acl.ts：`getAcl`（GET /acl?path=）、`setAcl`（PUT /acl，AclInfo body）
- [ ] T102 [P] [US6] 创建 src/pages/network/NetworkPage.vue：接口卡片网格布局，加载中显示 SkeletonList，空时显示 EmptyState
- [ ] T103 [P] [US6] 创建 src/pages/network/NetworkInterfaceCard.vue：接口名、MAC、IP 列表、MTU、StatusBadge（up=绿/down=红），up/down/dhcp 操作按钮
- [ ] T104 [US6] 在 NetworkInterfaceCard 中实现 up/down/dhcp：useRole.isAdmin 守卫（非 admin 禁用鼠标悬停提示"需要 admin 角色"），useConfirm（"[up/down/dhcp] 接口 [name] 可能导致当前连接中断，确认执行？"），执行后刷新卡片

- [ ] T105 [P] [US6] 创建 src/pages/acl/AclPage.vue：路径输入框 + 查询按钮，展示 owner/group/UNIX 权限位/ACL 条目列表，新增条目输入区
- [ ] T106 [US6] 在 AclPage 中实现 ACL 条目格式校验：输入框失焦和提交时验证 `^[ugom]:[^:]*:[rwx-]{3}$`，格式错误时行内显示"格式错误，示例：u:alice:rwx"，阻止提交

**Checkpoint**：US1~US6 均可独立工作，网络与 ACL 功能完整；admin 角色守卫行为验证通过。

---

## Phase 9：用户故事 7 — 多 Agent 管理（优先级：P7）

**目标**：设置页 Agent 列表增删改、顶部切换器快速切换、切换时上下文完全隔离（取消残留请求）、健康状态轮询显示。

**独立验证**：添加 2 台 agent 后切换，仪表板数据来自当前 agent；离线 agent 切换后显示"agent 不可达"占位状态。

### 用户故事 7 测试（宪法原则 II：MANDATORY，先于实现）

- [ ] T107 [P] [US7] 编写集成测试：添加/编辑/删除 agent 配置，列表更新；新增后调用 GET /health 显示在线/离线状态 在 tests/integration/multi-agent.spec.ts
- [ ] T108 [P] [US7] 编写集成测试：切换 agent 后 stores/agents.ts activeAgentId 更新，前一 agent 的 pending API 请求被 abort，新 agent 仪表板数据开始加载 在 tests/integration/multi-agent.spec.ts
- [ ] T109 [P] [US7] 编写 E2E 测试：添加第二台 agent（mock offline）→切换到它→仪表板显示"agent 不可达"；切换回第一台→数据恢复 在 tests/e2e/us7-multi-agent.spec.ts

### 用户故事 7 实现

- [ ] T110 [US7] 扩展 src/pages/settings/SettingsPage.vue：添加 Agent 列表管理区域，引入 AgentCard 列表和"添加 Agent"按钮，复用 AgentForm（带新增模式）
- [ ] T111 [P] [US7] 创建 src/components/agent/AgentCard.vue：主机名标签、地址、StatusBadge（在线/离线）、编辑/删除操作按钮
- [ ] T112 [P] [US7] 创建 src/components/agent/AgentSwitcher.vue：TopBar 下拉选择器，列出所有已配置 agent + 状态，`@change` 触发 store.setActiveAgent
- [ ] T113 [US7] 在 src/stores/agents.ts 中实现 `setActiveAgent`：取消当前 agent 的所有 pending Axios 请求（使用 AbortController），清除 UI store 的残留数据，更新 activeAgentId
- [ ] T114 [P] [US7] 将 AgentSwitcher 接入 src/components/layout/TopBar.vue；agent 切换后触发 router.replace('/dashboard') 强制刷新仪表板数据

**Checkpoint**：全部 7 个用户故事均可独立工作，多 Agent 切换功能完整，上下文隔离验证通过。

---

## Phase 10：完善与横切关注点（Polish）

**目标**：跨功能质量收尾、覆盖率达标验证、Bundle 体积检查、安全审查、quickstart 验证。

- [ ] T115 [P] 审查并补全 src/api/client.ts 错误码中文映射表：确保 UNAUTHORIZED/FORBIDDEN/NOT_FOUND/INVALID_INPUT/CONFLICT/INTERNAL 全部有对应中文提示，100% SC-005 合规
- [ ] T116 [P] ConfirmDialog.vue 键盘无障碍：Escape 键关闭对话框（取消），Enter 键触发确认按钮，`role="dialog"` + `aria-modal="true"` + `aria-labelledby` 属性
- [ ] T117 运行 `npm run coverage`，确认全局覆盖率 ≥ 80%、src/api/ 覆盖率 ≥ 90%；补写缺失测试至达标
- [ ] T118 [P] 运行 `node scripts/check-bundle-size.js`，确认 gzip 后初始 Bundle ≤ 300KB；若超出分析 bundle 并调整动态 import
- [ ] T119 运行 `npx playwright test`，确认全部 E2E 测试通过（US1~US7 主流程 + 危险操作确认）；修复任何失败用例
- [ ] T120 [P] CIFS 凭据安全审查（SC-007）：在 MountForm 中添加 CIFS 挂载，打开 devtools Network/Console/Application 标签，确认密码字段不出现在任何输出中
- [ ] T121 [P] 按照 quickstart.md 从零执行完整开发环境搭建流程，验证文档准确性，更新与实际不符的命令或配置
- [ ] T122 [P] 更新 README.md：添加项目简介、技术栈徽章、快速开始链接（指向 quickstart.md）

**Checkpoint（最终）**：所有覆盖率门禁通过，Bundle 体积合规，E2E 测试全绿，安全审查无问题，文档与代码一致。

---

## 依赖关系与执行顺序

### 阶段依赖

- **Phase 1（初始化）**：无依赖，立即开始
- **Phase 2（基础设施）**：依赖 Phase 1 完成，**阻塞所有用户故事阶段**
- **Phase 3（US1）**：依赖 Phase 2 完成，无其他用户故事依赖
- **Phase 4（US2）**：依赖 Phase 2 完成（US1 设置页可选集成）
- **Phase 5（US3）**：依赖 Phase 2 完成
- **Phase 6（US4）**：依赖 Phase 2 完成（使用 base64 工具函数）
- **Phase 7（US5）**：依赖 Phase 2 完成
- **Phase 8（US6）**：依赖 Phase 2 完成
- **Phase 9（US7）**：依赖 Phase 2 完成，推荐 US1 先完成（复用 AgentForm）
- **Phase 10（完善）**：依赖全部所需用户故事阶段完成

### 用户故事间依赖

- **US1（P1）**：Phase 2 完成后即可开始，无其他故事依赖 — **MVP 核心**
- **US2（P2）**：Phase 2 完成后可与 US1 并行，可选集成 US1 连通性反馈
- **US3（P3）**：Phase 2 完成后可并行开始
- **US4（P4）**：Phase 2 完成后可并行开始（依赖 base64 工具 T018）
- **US5（P5）**：Phase 2 完成后可并行开始
- **US6（P6）**：Phase 2 完成后可并行开始
- **US7（P7）**：推荐 US1 完成后开始（AgentForm 复用，体验更完整）

### 用户故事内部顺序

1. 测试任务 **FIRST**（MUST 先写并确认失败）
2. API 模块（基础数据访问）
3. 数据/类型层（types/index.ts 统一定义）
4. Service/Composable 层
5. 页面和组件（UI 层）
6. 角色守卫和错误处理集成

---

## 并行执行示例

### 用户故事 1 并行窗口

```
# 测试阶段（全部 [P]，同时编写）：
T038 settings.spec.ts
T039 dashboard.spec.ts
T040 api-system.test.ts
T041 us1-dashboard.spec.ts

# 实现阶段（[P] 标注项可同时进行）：
T042 src/api/system.ts
T043 src/pages/settings/SettingsPage.vue ← [P]
T046 src/pages/dashboard/CpuCard.vue     ← [P]
T047 src/pages/dashboard/MemoryCard.vue  ← [P]
T048 src/pages/dashboard/UptimeCard.vue  ← [P]
T049 src/pages/dashboard/DiskUsageCard.vue ← [P]
```

### Phase 2 基础设施并行窗口

```
# 以下任务可在 T021(client.ts) 完成后同时进行：
T022 src/stores/agents.ts   ← [P]
T023 src/stores/auth.ts     ← [P]
T024 src/stores/ui.ts       ← [P]
T026 ConfirmDialog.vue      ← [P]
T027 SkeletonList.vue       ← [P]
T028 EmptyState.vue         ← [P]
T029 StatusBadge.vue        ← [P]
T033 usePolling.ts          ← [P]
T034 useAgent.ts            ← [P]
T035 useConfirm.ts          ← [P]
T036 useRole.ts             ← [P]
```

---

## 实现策略

### MVP 优先（仅用户故事 1）

1. 完成 Phase 1（初始化）
2. 完成 Phase 2（基础设施）—— **关键阻塞项**
3. 完成 Phase 3（US1）
4. **停止并验证**：演示 Agent 配置 + 仪表板实时数据
5. 按需继续 US2、US3...

### 增量交付

1. Phase 1 + Phase 2 → 基础骨架就绪
2. Phase 3（US1）→ 可交付 MVP demo
3. Phase 4（US2）→ 进程管理上线
4. Phase 5（US3）→ 磁盘管理上线
5. Phase 6（US4）→ 文件管理器上线（最复杂，独立迭代）
6. Phase 7（US5）→ 共享管理上线
7. Phase 8（US6）→ 网络 + ACL 上线
8. Phase 9（US7）→ 多 Agent 上线
9. Phase 10 → 质量收尾

### 团队并行策略

Phase 2 完成后：
- 开发者 A：US1（MVP，最高优先）
- 开发者 B：US2 进程管理
- 开发者 C：US3 磁盘管理
- 开发者 D：US4 文件管理器（工作量最大）

---

## 备注

- `[P]` 任务 = 操作不同文件，无对未完成任务的依赖，可并行执行
- `[US1]~[US7]` 标签映射到 spec.md 中对应用户故事，保证可追溯性
- 每个用户故事均应独立可完成和测试
- 测试任务编写后需确认先失败（Red），再实现（Green），再重构（Refactor）
- 每完成一个完整任务或逻辑分组后提交一次 commit
- 在任何 Checkpoint 处可停下来独立验证该故事的完整性
- **宪法原则 II 禁止**：`test.skip`、`todo`、覆盖率注释豁免进主干
- **宪法原则 V 安全**：所有 console.log 路径确认不含 apiKey 和 password 字段
