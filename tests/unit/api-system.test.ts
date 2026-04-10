/**
 * 系统 API 单元测试
 * 测试 getSystemOverview 请求路径和响应类型
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { createMingyueClient } from '@/api/client'
import { getSystemOverview } from '@/api/system'

const API_BASE = 'http://localhost:7070/api/v1'

const server = setupServer(
  http.get(`${API_BASE}/system/overview`, () => {
    return HttpResponse.json({
      hostname: 'test-server',
      uptime: 86400,
      load: { load1: 0.5, load5: 0.6, load15: 0.7 },
      cpu: { cores: 4, usage: 25.5 },
      memory: {
        total: 8589934592,
        used: 4294967296,
        free: 4294967296,
        available: 4294967296,
        usagePercent: 50.0,
      },
      swap: { total: 2147483648, used: 0, free: 2147483648, usagePercent: 0.0 },
    })
  }),
  http.get(`${API_BASE}/health`, () => {
    return HttpResponse.json({ status: 'ok', version: '0.1.0' })
  })
)

beforeAll(() => server.listen())
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

describe('getSystemOverview', () => {
  it('应该返回系统概览数据', async () => {
    const client = createMingyueClient(API_BASE, 'test-key')
    const overview = await getSystemOverview(client)

    expect(overview).toBeDefined()
    expect(overview.hostname).toBe('test-server')
    expect(overview.uptime).toBe(86400)
    expect(overview.cpu.cores).toBe(4)
    expect(overview.cpu.usage).toBe(25.5)
    expect(overview.memory.usagePercent).toBe(50.0)
  })

  it('应该请求正确的 API 路径', async () => {
    let requestPath = ''
    server.use(
      http.get(`${API_BASE}/system/overview`, ({ request }) => {
        requestPath = new URL(request.url).pathname
        return HttpResponse.json({
          hostname: 'test',
          uptime: 0,
          load: { load1: 0, load5: 0, load15: 0 },
          cpu: { cores: 1, usage: 0 },
          memory: { total: 0, used: 0, free: 0, available: 0, usagePercent: 0 },
          swap: { total: 0, used: 0, free: 0, usagePercent: 0 },
        })
      })
    )
    const client = createMingyueClient(API_BASE, 'test-key')
    await getSystemOverview(client)
    expect(requestPath).toBe('/api/v1/system/overview')
  })

  it('应该在 401 时抛出 MingyueApiError', async () => {
    server.use(
      http.get(`${API_BASE}/system/overview`, () => {
        return HttpResponse.json({ code: 'UNAUTHORIZED', message: 'Unauthorized' }, { status: 401 })
      })
    )
    const client = createMingyueClient(API_BASE, 'invalid-key')
    await expect(getSystemOverview(client)).rejects.toThrow('未授权，请检查 API Key')
  })
})
