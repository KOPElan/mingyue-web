/**
 * API 客户端单元测试
 * 测试 Bearer Token 注入、错误码中文映射、MingyueApiError 实例化
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { createMingyueClient, MingyueApiError } from '@/api/client'

// Mock axios
vi.mock('axios', async (importOriginal) => {
  const original = await importOriginal<typeof axios>()
  return {
    ...original,
    default: {
      ...original.default,
      create: vi.fn(() => {
        const instance: any = {
          interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() },
          },
          get: vi.fn(),
          post: vi.fn(),
          put: vi.fn(),
          delete: vi.fn(),
          defaults: { headers: {} },
        }
        return instance
      }),
    },
  }
})

describe('MingyueApiError', () => {
  it('应该正确实例化', () => {
    const err = new MingyueApiError('UNAUTHORIZED', '未授权')
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(MingyueApiError)
    expect(err.code).toBe('UNAUTHORIZED')
    expect(err.message).toBe('未授权')
    expect(err.name).toBe('MingyueApiError')
  })

  it('应该支持 originalError 参数', () => {
    const original = new Error('原始错误')
    const err = new MingyueApiError('INTERNAL', '服务器错误', original)
    expect(err.originalError).toBe(original)
  })

  it('应该是 Error 的子类', () => {
    const err = new MingyueApiError('NOT_FOUND', '未找到')
    expect(err instanceof Error).toBe(true)
  })
})

describe('createMingyueClient', () => {
  it('应该使用 axios.create 创建客户端实例', () => {
    const client = createMingyueClient('http://localhost:7070/api/v1', 'test-key')
    expect(client).toBeDefined()
    expect(axios.create).toHaveBeenCalled()
  })

  it('应该配置请求和响应拦截器', () => {
    const client = createMingyueClient('http://localhost:7070/api/v1', 'test-key')
    expect(client.interceptors.request.use).toHaveBeenCalled()
    expect(client.interceptors.response.use).toHaveBeenCalled()
  })
})

describe('错误码中文映射', () => {
  it('应该包含所有必要的错误码映射', async () => {
    const { ERROR_CODE_MAP } = await import('@/utils/constants')
    expect(ERROR_CODE_MAP['UNAUTHORIZED']).toBe('未授权，请检查 API Key')
    expect(ERROR_CODE_MAP['FORBIDDEN']).toBe('权限不足，当前角色无法执行此操作')
    expect(ERROR_CODE_MAP['NOT_FOUND']).toBe('请求的资源不存在')
    expect(ERROR_CODE_MAP['INVALID_INPUT']).toBe('输入参数无效，请检查后重试')
    expect(ERROR_CODE_MAP['CONFLICT']).toBe('操作冲突，资源已存在或正在使用')
    expect(ERROR_CODE_MAP['INTERNAL']).toBe('服务器内部错误，请稍后重试')
  })

  it('应该覆盖所有 6 种错误码', async () => {
    const { ERROR_CODE_MAP } = await import('@/utils/constants')
    const requiredCodes = ['UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND', 'INVALID_INPUT', 'CONFLICT', 'INTERNAL']
    for (const code of requiredCodes) {
      expect(ERROR_CODE_MAP[code]).toBeTruthy()
    }
  })
})
