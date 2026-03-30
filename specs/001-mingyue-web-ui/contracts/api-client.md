# API 客户端契约：MingyueClient

**日期**: 2026-03-30  
**分支**: `001-mingyue-web-ui`  
**来源**: [research.md R-09](../research.md) + [spec.md FR-001~FR-004, FR-024](../spec.md)  
**实现文件**: `src/api/client.ts`（实现阶段创建）

---

## 概述

`MingyueClient` 是 mingyue-web 与 mingyue-go agent 通信的唯一入口。所有 Vue 组件和 composable MUST 通过此客户端发起 API 请求，禁止裸用 `fetch` 或 `axios`。

---

## 客户端接口契约

```typescript
// src/api/client.ts — 接口契约（非实现代码）

/**
 * MingyueClient 工厂函数
 * 根据 AgentConfig 创建绑定到特定 agent 的 HTTP 客户端实例
 * 每次切换 agent 时调用，不复用跨 agent 的实例
 */
function createMingyueClient(config: {
  baseUrl: string    // 如 "http://192.168.1.100:7070"
  apiKey: string     // Bearer Token（仅在此处使用，不扩散到其他层）
  agentId: string    // 用于响应回调中的 agent 隔离校验
  timeout?: number   // 默认 10000ms
}): MingyueClient

interface MingyueClient {
  // ─── 健康检查（无需 Bearer Token）───
  health(): Promise<HealthResponse>

  // ─── 系统监控 ───
  getSystemOverview(): Promise<SystemOverview>

  // ─── 进程管理 ───
  listProcesses(): Promise<Process[]>
  getProcess(pid: number): Promise<Process>
  killProcess(pid: number): Promise<void>

  // ─── 磁盘设备 ───
  listDiskDevices(): Promise<DiskDevice[]>
  getSmartHealth(device: string): Promise<SmartHealth>
  getDiskPower(device: string): Promise<DiskPowerInfo>
  setDiskPower(device: string, state: DiskPowerState): Promise<void>

  // ─── 挂载点 ───
  listMounts(): Promise<MountPoint[]>
  createMount(request: CreateMountRequest): Promise<MountPoint>
  deleteMount(mountpoint: string): Promise<void>
  // 注意：mountpoint 路径在内部自动 encodeURIComponent（FR-012）

  // ─── 文件管理 ───
  listFiles(path: string): Promise<FileEntry[]>
  statFile(path: string): Promise<FileEntry>
  readFile(path: string): Promise<FileContent>
  // 注意：返回的 content 为 Base64，调用方使用 decodeBase64() 工具函数解码
  writeFile(request: WriteFileRequest): Promise<void>
  // 注意：请求体中的 content 必须已是 Base64（调用方使用 encodeBase64() 编码）
  moveFile(from: string, to: string): Promise<void>
  copyFile(from: string, to: string): Promise<void>
  deleteFile(path: string): Promise<void>

  // ─── Samba 共享 ───
  listSmbShares(): Promise<SmbShare[]>
  createSmbShare(request: CreateSmbShareRequest): Promise<SmbShare>
  getSmbShare(name: string): Promise<SmbShare>
  updateSmbShare(name: string, request: UpdateSmbShareRequest): Promise<SmbShare>
  deleteSmbShare(name: string): Promise<void>

  // ─── Samba 用户 ───
  listSmbUsers(): Promise<SmbUser[]>
  createSmbUser(request: CreateSmbUserRequest): Promise<SmbUser>
  // CreateSmbUserRequest.password 必须在调用方组件提交后立即清除 state
  updateSmbUserPassword(username: string, password: string): Promise<void>
  deleteSmbUser(username: string): Promise<void>

  // ─── NFS 导出 ───
  listNfsExports(): Promise<NfsExport[]>
  createNfsExport(request: CreateNfsExportRequest): Promise<NfsExport>
  getNfsExport(name: string): Promise<NfsExport>
  updateNfsExport(name: string, request: UpdateNfsExportRequest): Promise<NfsExport>
  deleteNfsExport(name: string): Promise<void>

  // ─── 网络接口 ───
  listNetworkInterfaces(): Promise<NetworkInterface[]>
  getNetworkInterface(name: string): Promise<NetworkInterface>
  updateNetworkInterface(name: string, request: UpdateNeterfaceRequest): Promise<NetworkInterface>
  // 此方法仅 admin 角色可用；角色校验由 UI 层 useRole() 在调用前拦截

  // ─── ACL ───
  getAcl(path: string): Promise<AclInfo>
  setAcl(request: SetAclRequest): Promise<void>
}
```

---

## 错误处理契约

所有方法在 API 请求失败时 MUST 抛出 `MingyueApiError`，不允许返回 `null` 或 `undefined` 表示错误。

```typescript
class MingyueApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,                    // 英文原始消息（来自 agent 响应体）
    public readonly userMessage: string, // 中文用户提示（由错误码映射表生成）
    public readonly status: number,      // HTTP 状态码
  ) { super(message) }
}

type ApiErrorCode =
  | 'UNAUTHORIZED'   // 401 → 跳转 /settings
  | 'FORBIDDEN'      // 403 → 通知：权限不足
  | 'NOT_FOUND'      // 404 → 通知：资源不存在
  | 'INVALID_INPUT'  // 422 → 通知：输入格式错误
  | 'CONFLICT'       // 409 → 通知：操作冲突
  | 'INTERNAL'       // 5xx → 通知：服务器内部错误
  | 'NETWORK_ERROR'  // 网络不通 → 通知：无法连接到 agent
  | 'TIMEOUT'        // 超时 → 通知：连接超时
```

**调用方处理约定**：
- 组件层 SHOULD 使用 `try/catch` 捕获 `MingyueApiError` 并调用 `ui.notify(error.userMessage, 'error')`
- `UNAUTHORIZED` 错误由 Axios 响应拦截器统一处理（跳转 /settings），组件层无需重复处理
- 其余错误码通过全局通知系统显示，组件层可选择性覆盖默认行为

---

## 安全约束（Security Constraints）

以下约束来自宪法原则 V，实现时 MUST 遵守：

| 约束 | 说明 | 相关需求 |
|------|------|---------|
| apiKey 不进入响应式状态 | `createMingyueClient` 接收 `apiKey` 参数，直接注入 Axios 默认 header，不存入 Vue ref/reactive | FR-001 |
| Base64 解码封装 | `readFile()` 返回 `FileContent.content` 为 Base64 字符串，调用方 MUST 用 `utils/base64.ts` 的 `decodeBase64()` 解码，不直接调用 `atob()` | FR-015 |
| mountpoint URL 编码 | `deleteMount(mountpoint)` 内部自动对 `mountpoint` 执行 `encodeURIComponent()`，调用方传入原始路径即可 | FR-012 |
| CIFS 密码不记录 | `createMount()` 的 `CreateMountRequest.password` 参数不进入任何日志或监控；调用方在 `await` 返回后立即清除 | FR-011 |
| console 禁止输出 key | Axios 拦截器中禁止打印含 `Authorization: Bearer` 的完整 header | 宪法原则 V |

---

## 工具函数契约

```typescript
// src/utils/base64.ts
/**
 * 将 UTF-8 文本编码为 Base64 字符串（用于写入文件）
 * 使用 TextEncoder 支持 Unicode 字符，避免 btoa() 的 Latin-1 限制
 */
function encodeBase64(text: string): string

/**
 * 将 Base64 字符串解码为 UTF-8 文本（用于读取文件）
 */
function decodeBase64(base64: string): string

// src/utils/encoding.ts
/**
 * 安全地将文件路径编码为 URL 路径段
 * 示例："/mnt/data share" → "%2Fmnt%2Fdata%20share"
 */
function encodeMountPath(mountpoint: string): string
```

---

## 健康检查响应

```typescript
interface HealthResponse {
  status: 'ok' | 'degraded'
  version?: string
  uptime?: number
}
```

`GET /health` 无需 Bearer Token，用于 agent 在线状态轮询（FR-024）。

---

## 补充类型

```typescript
interface DiskPowerInfo {
  device: string
  state: DiskPowerState
}

type DiskPowerState = 'active' | 'idle' | 'standby' | 'sleeping' | 'unknown'

type CreateNfsExportRequest = Omit<NfsExport, 'enabled'>
type UpdateNfsExportRequest = Partial<Omit<NfsExport, 'name'>>
```
