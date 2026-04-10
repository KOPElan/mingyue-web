# 数据模型：mingyue-web 可视化管理界面

**日期**: 2026-03-30  
**分支**: `001-mingyue-web-ui`  
**来源**: [spec.md 关键实体章节](./spec.md) + [research.md R-03](./research.md)

---

## 实体总览

| 实体 | 对应 API 模块 | TypeScript 接口名 |
|------|-------------|-------------------|
| Agent 配置 | 本地存储（不来自 API） | `AgentConfig` |
| 系统概览 | `GET /system/overview` | `SystemOverview` |
| 进程 | `GET /processes` | `Process` |
| 磁盘设备 | `GET /disks/devices` | `DiskDevice` |
| 挂载点 | `GET /disks/mounts` | `MountPoint` |
| SMART 健康 | `GET /disks/{device}/smart` | `SmartHealth` |
| 文件条目 | `GET /files` | `FileEntry` |
| SMB 共享 | `GET /smb/shares` | `SmbShare` |
| SMB 用户 | `GET /smb/users` | `SmbUser` |
| NFS 导出 | `GET /nfs/exports` | `NfsExport` |
| 网络接口 | `GET /network/interfaces` | `NetworkInterface` |
| ACL 信息 | `GET /acl` | `AclInfo` |
| ACL 条目 | （嵌套在 AclInfo 中） | `AclEntry` |
| API 错误响应 | （所有 API 错误体） | `ApiError` |

---

## 详细实体定义

### AgentConfig（Agent 配置）
> 来源：本地 localStorage，由用户手动输入。研究结论 R-03 / R-07。

```typescript
interface AgentConfig {
  id: string                              // UUID v4，本地生成
  label: string                           // 用户自定义标签，如"家里的 NAS"
  baseUrl: string                         // 如 "http://192.168.1.100:7070"
  // apiKey 不存入此对象的响应式状态；
  // 仅在 localStorage 读写时临时经手，读取后立即注入 Axios header
  role: 'viewer' | 'operator' | 'admin' | 'unknown'  // 用户声明或通过 403 响应推断
  online: boolean                         // GET /health 检测结果
  lastSeen?: string                       // ISO 8601，最后一次在线时间
}
```

**关系**：`AgentConfig` 是全局 `agents` store 的核心实体；`activeAgentId` 指向其中一个。  
**约束**：`baseUrl` 不得以 `/` 结尾；`label` 长度 1–64 字符。

---

### SystemOverview（系统概览）
> 来源：`GET /api/v1/system/overview`

```typescript
interface SystemOverview {
  hostname: string             // 主机名
  os: string                   // 操作系统描述，如 "Ubuntu 24.04 LTS"
  kernel: string               // 内核版本
  uptime: number               // 秒，从 agent 侧获取
  load: {
    load1: number              // 1 分钟负载
    load5: number              // 5 分钟负载
    load15: number             // 15 分钟负载
  }
  cpu: {
    usage: number              // 使用率百分比，0–100
    cores: number              // 逻辑核数
    model: string              // CPU 型号
  }
  memory: {
    total: number              // 字节
    used: number               // 字节
    free: number               // 字节
    usagePercent: number       // 0–100
  }
  swap: {
    total: number
    used: number
    usagePercent: number
  }
}
```

---

### Process（进程）
> 来源：`GET /api/v1/processes`（列表）；`GET /api/v1/processes/{pid}`（单条）

```typescript
interface Process {
  pid: number                  // 进程 ID
  name: string                 // 进程名
  status: ProcessStatus        // 运行状态
  cpuPercent: number           // CPU 使用百分比
  memoryRss: number            // 常驻内存（字节）
  memoryPercent: number        // 内存使用百分比
  user: string                 // 所属用户
  cmdline: string              // 完整命令行（可能为空）
  createTime: number           // Unix 时间戳（秒）
}

type ProcessStatus =
  | 'running'
  | 'sleeping'
  | 'stopped'
  | 'zombie'
  | 'idle'
  | 'dead'
  | string   // 兼容未知状态
```

---

### DiskDevice（磁盘设备）
> 来源：`GET /api/v1/disks/devices`

```typescript
interface DiskDevice {
  name: string                 // 设备名，如 "sda"
  path: string                 // 设备路径，如 "/dev/sda"
  size: number                 // 字节
  type: 'disk' | 'partition' | 'rom' | string
  model?: string               // 设备型号
  serial?: string              // 序列号
  rotational: boolean          // 是否为机械盘
  removable: boolean           // 是否为可移除设备
}
```

---

### MountPoint（挂载点）
> 来源：`GET /api/v1/disks/mounts`；`POST /api/v1/disks/mounts`（创建）；`DELETE /api/v1/disks/mounts/{mountpoint}`（删除）

```typescript
interface MountPoint {
  device: string               // 源设备或网络路径，如 "/dev/sda1" 或 "//nas/share"
  mountpoint: string           // 目标挂载路径，如 "/mnt/data"
  fstype: string               // 文件系统类型，如 "ext4"、"cifs"、"nfs"
  options: string              // 挂载选项，逗号分隔
  total: number                // 总容量（字节）
  used: number                 // 已用（字节）
  free: number                 // 可用（字节）
  usagePercent: number         // 0–100
}

// 创建挂载请求体
interface CreateMountRequest {
  device: string
  mountpoint: string
  fstype: 'ext4' | 'xfs' | 'btrfs' | 'ntfs' | 'vfat' | 'cifs' | 'nfs' | string
  options?: string
  // CIFS 专用（提交后立即清除，不持久化）
  username?: string
  password?: string
}
```

---

### SmartHealth（SMART 健康信息）
> 来源：`GET /api/v1/disks/{device}/smart`

```typescript
interface SmartHealth {
  device: string
  available: boolean           // false → smartmontools 未安装或设备不支持
  healthy: boolean
  temperature?: number         // 摄氏度
  powerOnHours?: number        // 通电时间（小时）
  reallocatedSectors?: number  // 重新分配扇区数
  attributes?: SmartAttribute[]
}

interface SmartAttribute {
  id: number
  name: string
  value: number
  worst: number
  thresh: number
  rawValue: string
  failed: boolean
}
```

---

### FileEntry（文件条目）
> 来源：`GET /api/v1/files?path=`（目录列表）；`GET /api/v1/files/stat?path=`（单条详情）

```typescript
interface FileEntry {
  name: string
  path: string                 // 完整路径
  type: 'file' | 'dir' | 'symlink' | 'unknown'
  size: number                 // 字节（目录为 0 或 du 结果）
  modifiedAt: string           // ISO 8601
  permissions: string          // UNIX 权限字符串，如 "-rw-r--r--"
  mode: number                 // 八进制权限值，如 0o644
  owner: string                // 所有者用户名
  group: string                // 所属组名
  linkTarget?: string          // 仅 symlink 有效
}

// 读取文件内容响应（GET /files/read?path=）
interface FileContent {
  path: string
  content: string              // Base64 编码，使用 atob() 解码
  size: number
  encoding: 'base64'
}

// 写入文件请求体（POST /files）
interface WriteFileRequest {
  path: string
  content: string              // btoa() 编码后的 Base64 字符串
  mode?: number                // 可选，八进制权限，如 0o644
}
```

**重要约束**：
- 读取时：`const text = atob(response.content)`
- 写入时：`const encoded = btoa(unescape(encodeURIComponent(text)))` （支持 UTF-8）

---

### SmbShare（Samba 共享）
> 来源：`GET/POST /api/v1/smb/shares`；`GET/PUT/DELETE /api/v1/smb/shares/{name}`

```typescript
interface SmbShare {
  name: string                 // 共享名称（唯一标识）
  path: string                 // 本地路径
  comment?: string             // 注释说明
  readOnly: boolean
  browseable: boolean
  guestOk: boolean
  validUsers?: string[]        // 允许访问的用户列表
  enabled: boolean
}

type CreateSmbShareRequest = Omit<SmbShare, 'enabled'>
type UpdateSmbShareRequest = Partial<Omit<SmbShare, 'name'>>
```

---

### SmbUser（Samba 用户）
> 来源：`GET/POST /api/v1/smb/users`；`PUT /api/v1/smb/users/{username}/password`；`DELETE /api/v1/smb/users/{username}`

```typescript
interface SmbUser {
  username: string
  enabled: boolean
  lastChanged?: string         // ISO 8601，密码最后修改时间
}

// 创建用户请求（密码提交后立即清除表单状态）
interface CreateSmbUserRequest {
  username: string
  password: string             // [宪法原则 V] 提交后立即清除组件 state
}
```

---

### NfsExport（NFS 导出）
> 来源：`GET/POST /api/v1/nfs/exports`；`GET/PUT/DELETE /api/v1/nfs/exports/{name}`

```typescript
interface NfsExport {
  name: string                           // 导出名称（唯一标识）
  path: string                           // 本地导出路径
  clients: NfsClient[]
  enabled: boolean
}

interface NfsClient {
  host: string                           // 允许的客户端，如 "192.168.1.0/24" 或 "*"
  options: string                        // 选项，如 "rw,sync,no_subtree_check"
}
```

---

### NetworkInterface（网络接口）
> 来源：`GET /api/v1/network/interfaces`；`GET/PUT /api/v1/network/interfaces/{name}`

```typescript
interface NetworkInterface {
  name: string                           // 接口名，如 "eth0"、"enp3s0"
  mac: string                            // MAC 地址
  addresses: NetworkAddress[]
  mtu: number
  up: boolean                            // 当前启用状态
  flags: string[]                        // 如 ["BROADCAST", "MULTICAST", "UP"]
  speed?: number                         // Mbps，可选
}

interface NetworkAddress {
  address: string                        // IP 地址（IPv4 或 IPv6）
  netmask: string
  broadcast?: string
  family: 'IPv4' | 'IPv6'
}

// PUT /network/interfaces/{name} 请求体
interface UpdateNeterfaceRequest {
  up?: boolean                           // 启用/禁用
  dhcp?: boolean                         // 触发 DHCP 刷新
}
```

---

### AclInfo / AclEntry（ACL 信息与条目）
> 来源：`GET /api/v1/acl?path=`；`PUT /api/v1/acl`

```typescript
interface AclInfo {
  path: string
  owner: string
  group: string
  mode: string                           // 八进制字符串，如 "0755"
  entries: AclEntry[]
  supported: boolean                     // false → getfacl 未安装
}

interface AclEntry {
  tag: 'user' | 'group' | 'other' | 'mask'
  qualifier: string                      // 用户名/组名（other/mask 为空字符串）
  permissions: string                    // 如 "rwx"、"r--"、"---"
  // 格式化为字符串：`${tag}:${qualifier}:${permissions}`
  // 例：'u:alice:rwx'、'g:devs:r-x'、'o::r--'
}

// PUT /acl 请求体
interface SetAclRequest {
  path: string
  entries: AclEntry[]
}
```

**格式校验正则**（前端校验，FR-022）：
```typescript
const ACL_ENTRY_REGEX = /^[ugom]:[^:]*:[rwx-]{3}$/
```

---

### ApiError（统一错误响应）
> 来源：所有 API 错误返回体格式

```typescript
interface ApiError {
  code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'INVALID_INPUT' | 'CONFLICT' | 'INTERNAL'
  message: string              // 英文原始消息（不直接展示给用户）
}
```

---

## 实体关系图

```
AgentConfig (1) ──── (*) [通过 API 获取以下所有实体]
                          │
              ┌───────────┼────────────────────────────────┐
              │           │                                │
       SystemOverview  Process[]   DiskDevice[]     MountPoint[]
                                    SmartHealth       │
                                                   FileEntry[]
                                                   SmbShare[]
                                                   SmbUser[]
                                                   NfsExport[]
                                                   NetworkInterface[]
                                                   AclInfo
```

---

## 状态机

### 进程状态（ProcessStatus）
```
running → sleeping → stopped → zombie (→ dead, 系统清理)
                 ↓
               idle
```

### 挂载点状态
```
[未挂载] → (POST /disks/mounts) → [已挂载] → (DELETE /disks/mounts/{mountpoint}) → [已卸载]
                                    │
                               (使用中) → 卸载失败（CONFLICT）→ 强制卸载（options: force）
```

### Agent 在线状态
```
unknown → (GET /health 成功) → online
       → (GET /health 失败 / 超时) → offline
online ↔ offline（每 5s 轮询切换）
```
