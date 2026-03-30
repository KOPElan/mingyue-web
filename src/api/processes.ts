/**
 * 进程管理 API
 */

import type { AxiosInstance } from 'axios'
import type { ProcessListResponse, Process } from '@/types'

/**
 * 获取进程列表
 */
export async function getProcesses(client: AxiosInstance): Promise<ProcessListResponse> {
  const response = await client.get<ProcessListResponse>('/processes')
  return response.data
}

/**
 * 获取单个进程详情
 */
export async function getProcess(client: AxiosInstance, pid: number): Promise<Process> {
  const response = await client.get<Process>(`/processes/${pid}`)
  return response.data
}

/**
 * 终止进程
 */
export async function killProcess(client: AxiosInstance, pid: number): Promise<void> {
  await client.delete(`/processes/${pid}`)
}
