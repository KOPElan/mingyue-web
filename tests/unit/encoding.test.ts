/**
 * URL 编码工具函数测试
 */

import { describe, it, expect } from 'vitest'
import { encodeMountPath, decodeMountPath } from '@/utils/encoding'

describe('encoding utils', () => {
  it('应该正确编码挂载点路径', () => {
    const path = '/mnt/data'
    const encoded = encodeMountPath(path)
    expect(encoded).toBe('%2Fmnt%2Fdata')
  })

  it('应该正确解码挂载点路径', () => {
    const encoded = '%2Fmnt%2Fdata'
    const decoded = decodeMountPath(encoded)
    expect(decoded).toBe('/mnt/data')
  })

  it('应该正确处理带空格的路径', () => {
    const path = '/mnt/my data'
    const encoded = encodeMountPath(path)
    expect(encoded).toContain('%20')
    expect(decodeMountPath(encoded)).toBe(path)
  })

  it('应该正确处理中文路径', () => {
    const path = '/挂载/数据'
    const encoded = encodeMountPath(path)
    expect(encoded).toBeTruthy()
    expect(decodeMountPath(encoded)).toBe(path)
  })

  it('应该正确处理特殊字符', () => {
    const path = '/mnt/data#test?query=1'
    const encoded = encodeMountPath(path)
    expect(encoded).toBeTruthy()
    expect(decodeMountPath(encoded)).toBe(path)
  })
})
