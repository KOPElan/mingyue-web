/**
 * Base64 工具函数测试
 */

import { describe, it, expect } from 'vitest'
import { encodeBase64, decodeBase64 } from '@/utils/base64'

describe('base64 utils', () => {
  it('应该正确编码 ASCII 字符串', () => {
    const input = 'Hello World'
    const encoded = encodeBase64(input)
    expect(encoded).toBeTruthy()
    expect(decodeBase64(encoded)).toBe(input)
  })

  it('应该正确编码中文字符串', () => {
    const input = '你好世界'
    const encoded = encodeBase64(input)
    expect(encoded).toBeTruthy()
    expect(decodeBase64(encoded)).toBe(input)
  })

  it('应该正确编码混合字符串', () => {
    const input = 'Hello 世界 123 !@#'
    const encoded = encodeBase64(input)
    expect(encoded).toBeTruthy()
    expect(decodeBase64(encoded)).toBe(input)
  })

  it('应该正确处理空字符串', () => {
    const input = ''
    const encoded = encodeBase64(input)
    expect(decodeBase64(encoded)).toBe(input)
  })

  it('应该正确处理特殊字符', () => {
    const input = '😀 🎉 \n\t\r'
    const encoded = encodeBase64(input)
    expect(encoded).toBeTruthy()
    expect(decodeBase64(encoded)).toBe(input)
  })
})
