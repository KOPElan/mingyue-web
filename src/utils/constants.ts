/**
 * 全局常量定义
 */

/**
 * 轮询间隔（毫秒）
 */
export const POLLING_INTERVAL = 5000

/**
 * 文件预览大小限制（字节）
 */
export const FILE_PREVIEW_LIMIT = 1024 * 1024 // 1MB

/**
 * Toast 默认显示时间（毫秒）
 */
export const TOAST_DURATION = 3000

/**
 * API 请求超时时间（毫秒）
 */
export const API_TIMEOUT = 30000

/**
 * ACL 条目正则表达式
 * 格式: [u|g|o|m]:[qualifier]:[rwx-]
 * 例如: u:alice:rwx, g:staff:r-x, o::r--
 */
export const ACL_ENTRY_REGEX = /^(u|g|o|m):([^:]*):([rwx-]{3})$/

/**
 * API 错误码映射到中文消息
 */
export const ERROR_CODE_MAP: Record<string, string> = {
  UNAUTHORIZED: '未授权，请检查 API Key',
  FORBIDDEN: '权限不足，当前角色无法执行此操作',
  NOT_FOUND: '请求的资源不存在',
  INVALID_INPUT: '输入参数无效，请检查后重试',
  CONFLICT: '操作冲突，资源已存在或正在使用',
  INTERNAL: '服务器内部错误，请稍后重试',
}

/**
 * 默认 API 端口
 */
export const DEFAULT_API_PORT = 7070

/**
 * 健康检查端点（无需认证）
 */
export const HEALTH_ENDPOINT = '/health'

/**
 * API 路径前缀
 */
export const API_PREFIX = '/api/v1'

/**
 * 进程状态映射
 */
export const PROCESS_STATE_MAP: Record<string, string> = {
  R: '运行',
  S: '睡眠',
  D: '不可中断',
  Z: '僵尸',
  T: '停止',
  I: '空闲',
}

/**
 * 磁盘类型映射
 */
export const DISK_TYPE_MAP: Record<string, string> = {
  hdd: '机械硬盘',
  ssd: '固态硬盘',
  nvme: 'NVMe',
  usb: 'USB 存储',
  unknown: '未知',
}

/**
 * 文件系统类型
 */
export const FILESYSTEM_TYPES = [
  'ext4',
  'ext3',
  'xfs',
  'btrfs',
  'ntfs',
  'vfat',
  'exfat',
  'nfs',
  'cifs',
]

/**
 * 常用挂载选项
 */
export const COMMON_MOUNT_OPTIONS = [
  'rw',
  'ro',
  'noatime',
  'nodiratime',
  'noexec',
  'nosuid',
  'nodev',
  'user',
  'users',
  'auto',
  'noauto',
]

/**
 * NFS 常用选项
 */
export const NFS_COMMON_OPTIONS = [
  'rw',
  'ro',
  'sync',
  'async',
  'no_root_squash',
  'root_squash',
  'all_squash',
  'no_subtree_check',
  'subtree_check',
]
