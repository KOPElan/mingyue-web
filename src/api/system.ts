/**
 * 系统监控 API
 */

import type { AxiosInstance } from 'axios'
import type { SystemOverview } from '@/types'

/**
 * 获取系统概览
 */
export async function getSystemOverview(client: AxiosInstance): Promise<SystemOverview> {
  const response = await client.get<SystemOverview>('/system/overview')
  return response.data
}
