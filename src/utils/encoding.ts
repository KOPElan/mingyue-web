/**
 * URL 编码工具
 * 用于路径参数的安全编码
 */

/**
 * 对挂载点路径进行 URL 编码
 * DELETE /disks/mounts/{mountpoint} 需要编码路径
 * 例如: /mnt/data -> %2Fmnt%2Fdata
 */
export function encodeMountPath(path: string): string {
  return encodeURIComponent(path)
}

/**
 * 解码挂载点路径
 */
export function decodeMountPath(encodedPath: string): string {
  return decodeURIComponent(encodedPath)
}
