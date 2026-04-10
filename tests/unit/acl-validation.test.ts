/**
 * ACL 条目格式验证单元测试
 * 测试正则表达式对合法/非法 ACL 条目格式的校验
 */

import { describe, it, expect } from 'vitest'
import { ACL_ENTRY_REGEX } from '@/utils/constants'

describe('ACL_ENTRY_REGEX', () => {
  // 正例
  describe('合法的 ACL 条目格式', () => {
    it('应该匹配 u:alice:rwx', () => {
      expect(ACL_ENTRY_REGEX.test('u:alice:rwx')).toBe(true)
    })

    it('应该匹配 g:devs:r-x', () => {
      expect(ACL_ENTRY_REGEX.test('g:devs:r-x')).toBe(true)
    })

    it('应该匹配 o::r--', () => {
      expect(ACL_ENTRY_REGEX.test('o::r--')).toBe(true)
    })

    it('应该匹配 m::rwx', () => {
      expect(ACL_ENTRY_REGEX.test('m::rwx')).toBe(true)
    })

    it('应该匹配 u:root:---', () => {
      expect(ACL_ENTRY_REGEX.test('u:root:---')).toBe(true)
    })

    it('应该匹配含数字的用户名 u:user1:rw-', () => {
      expect(ACL_ENTRY_REGEX.test('u:user1:rw-')).toBe(true)
    })

    it('应该匹配 g::rwx（无组名）', () => {
      expect(ACL_ENTRY_REGEX.test('g::rwx')).toBe(true)
    })
  })

  // 反例
  describe('非法的 ACL 条目格式', () => {
    it('不应匹配空字符串', () => {
      expect(ACL_ENTRY_REGEX.test('')).toBe(false)
    })

    it('不应匹配无效标签 x:alice:rwx', () => {
      expect(ACL_ENTRY_REGEX.test('x:alice:rwx')).toBe(false)
    })

    it('不应匹配权限位错误 u:alice:rw（只有2位）', () => {
      expect(ACL_ENTRY_REGEX.test('u:alice:rw')).toBe(false)
    })

    it('不应匹配权限位错误 u:alice:rwxx（4位）', () => {
      expect(ACL_ENTRY_REGEX.test('u:alice:rwxx')).toBe(false)
    })

    it('不应匹配无效权限字符 u:alice:zzz', () => {
      expect(ACL_ENTRY_REGEX.test('u:alice:zzz')).toBe(false)
    })

    it('不应匹配缺少分隔符 ualicerwx', () => {
      expect(ACL_ENTRY_REGEX.test('ualicerwx')).toBe(false)
    })

    it('不应匹配大写标签 U:alice:rwx', () => {
      expect(ACL_ENTRY_REGEX.test('U:alice:rwx')).toBe(false)
    })

    it('不应匹配大写权限 u:alice:RWX', () => {
      expect(ACL_ENTRY_REGEX.test('u:alice:RWX')).toBe(false)
    })
  })
})
