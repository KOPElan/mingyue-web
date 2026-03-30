/**
 * mingyue-web 类型定义
 * 对应 mingyue-go API 的数据模型
 */

// ==================== 通用类型 ====================

/**
 * API 响应包装
 */
export interface ApiResponse<T> {
  data: T
  message?: string
}

/**
 * API 错误响应
 */
export interface ApiError {
  code: string
  message: string
}

/**
 * Agent 配置
 */
export interface AgentConfig {
  id: string
  name: string
  host: string // hostname or IP
  port: number
  apiKey: string
  role: 'viewer' | 'operator' | 'admin'
}

/**
 * Agent 健康状态
 */
export interface AgentHealth {
  status: 'online' | 'offline' | 'error'
  version?: string
  lastCheck: number // timestamp
  error?: string
}

// ==================== 系统监控 ====================

/**
 * 系统概览
 */
export interface SystemOverview {
  hostname: string
  uptime: number // 秒
  load: {
    load1: number
    load5: number
    load15: number
  }
  cpu: {
    cores: number
    usage: number // 0-100
  }
  memory: {
    total: number // bytes
    used: number
    free: number
    available: number
    usagePercent: number // 0-100
  }
  swap: {
    total: number
    used: number
    free: number
    usagePercent: number
  }
}

// ==================== 进程管理 ====================

/**
 * 进程信息
 */
export interface Process {
  pid: number
  name: string
  user: string
  state: string // R, S, D, Z, T
  cpuPercent: number
  memPercent: number
  vsz: number // 虚拟内存 KB
  rss: number // 物理内存 KB
  tty: string
  startTime: string
  cmdline: string
}

export interface ProcessListResponse {
  processes: Process[]
  total: number
}

// ==================== 磁盘管理 ====================

/**
 * 磁盘设备
 */
export interface DiskDevice {
  name: string // e.g., sda, nvme0n1
  path: string // e.g., /dev/sda
  size: number // bytes
  model: string
  serial: string
  type: 'hdd' | 'ssd' | 'nvme' | 'usb' | 'unknown'
  removable: boolean
}

/**
 * 挂载点
 */
export interface MountPoint {
  device: string
  mountpoint: string
  fstype: string
  options: string[]
  total: number // bytes
  used: number
  free: number
  usagePercent: number
}

/**
 * 挂载请求
 */
export interface MountRequest {
  device: string
  mountpoint: string
  fstype: string
  options?: string[]
  // CIFS 专用
  username?: string
  password?: string
}

/**
 * SMART 健康信息
 */
export interface SmartHealth {
  healthy: boolean
  temperature?: number // Celsius
  powerOnHours?: number
  powerCycleCount?: number
  attributes?: SmartAttribute[]
}

export interface SmartAttribute {
  id: number
  name: string
  value: number
  worst: number
  threshold: number
  raw: string
  flags: string
}

/**
 * 磁盘电源状态
 */
export interface DiskPowerStatus {
  state: 'active' | 'idle' | 'standby' | 'sleep' | 'unknown'
}

// ==================== 文件管理 ====================

/**
 * 文件/目录条目
 */
export interface FileEntry {
  name: string
  path: string
  isDir: boolean
  size: number
  mode: number // Unix permissions
  modTime: string // ISO 8601
  owner: string
  group: string
}

/**
 * 文件详细信息
 */
export interface FileStat {
  name: string
  path: string
  isDir: boolean
  size: number
  mode: number
  modTime: string
  owner: string
  group: string
  uid: number
  gid: number
  nlink: number
}

/**
 * 文件内容读取响应
 */
export interface FileReadResponse {
  content: string // Base64 encoded
  size: number
  modTime: string
}

/**
 * 文件写入请求
 */
export interface FileWriteRequest {
  path: string
  content: string // Base64 encoded
  mode?: number
  createDir?: boolean
}

/**
 * 文件移动/复制请求
 */
export interface FileOperationRequest {
  from: string
  to: string
  overwrite?: boolean
}

// ==================== 共享管理 ====================

/**
 * Samba 共享
 */
export interface SmbShare {
  name: string
  path: string
  comment?: string
  browseable: boolean
  readonly: boolean
  guestOk: boolean
  validUsers?: string[]
  writeList?: string[]
  createMask?: string
  directoryMask?: string
}

/**
 * Samba 用户
 */
export interface SmbUser {
  username: string
  enabled: boolean
}

/**
 * Samba 用户密码设置
 */
export interface SmbUserPasswordRequest {
  password: string
}

/**
 * NFS 导出
 */
export interface NfsExport {
  name: string
  path: string
  clients: NfsClient[]
  options?: string[]
}

export interface NfsClient {
  host: string // IP, hostname, or network (e.g., 192.168.1.0/24)
  options: string[] // e.g., rw, sync, no_root_squash
}

// ==================== 网络管理 ====================

/**
 * 网络接口
 */
export interface NetworkInterface {
  name: string
  up: boolean
  addresses: NetworkAddress[]
  mtu: number
  mac?: string
  speed?: number // Mbps
  duplex?: 'full' | 'half' | 'unknown'
}

export interface NetworkAddress {
  ip: string
  mask: string
  family: 'ipv4' | 'ipv6'
}

/**
 * 网络接口更新请求
 */
export interface NetworkInterfaceUpdateRequest {
  up?: boolean
  dhcp?: boolean
  addresses?: NetworkAddress[]
}

// ==================== ACL 管理 ====================

/**
 * ACL 条目
 */
export interface AclEntry {
  tag: 'user' | 'group' | 'other' | 'mask'
  qualifier?: string // user/group name
  permissions: string // rwx- format
}

/**
 * ACL 查询响应
 */
export interface AclResponse {
  path: string
  owner: string
  group: string
  mode: number
  entries: AclEntry[]
}

/**
 * ACL 设置请求
 */
export interface AclSetRequest {
  path: string
  entries: AclEntry[]
  recursive?: boolean
}

// ==================== UI 状态 ====================

/**
 * Toast 消息
 */
export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

/**
 * 确认对话框选项
 */
export interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}
