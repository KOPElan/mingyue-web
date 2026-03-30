/**
 * Base64 编解码工具
 * 安全包装 btoa/atob，处理 Unicode 字符
 */

/**
 * 将字符串编码为 Base64
 * 支持 Unicode 字符
 */
export function encodeBase64(str: string): string {
  try {
    // 先转换为 UTF-8 字节序列，再编码为 Base64
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16))
      })
    )
  } catch (error) {
    console.error('Base64 编码失败:', error)
    throw new Error('Base64 编码失败')
  }
}

/**
 * 将 Base64 解码为字符串
 * 支持 Unicode 字符
 */
export function decodeBase64(str: string): string {
  try {
    // 先解码 Base64，再从 UTF-8 字节序列还原
    return decodeURIComponent(
      atob(str)
        .split('')
        .map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join('')
    )
  } catch (error) {
    console.error('Base64 解码失败:', error)
    throw new Error('Base64 解码失败')
  }
}
