/**
 * NFS 导出管理 API
 */

import type { AxiosInstance } from 'axios'
import type { NfsExport } from '@/types'

/**
 * 获取 NFS 导出列表
 */
export async function getNfsExports(client: AxiosInstance): Promise<NfsExport[]> {
  const response = await client.get<{ exports: NfsExport[] }>('/nfs/exports')
  return response.data.exports
}

/**
 * 获取单个 NFS 导出
 */
export async function getNfsExport(client: AxiosInstance, name: string): Promise<NfsExport> {
  const response = await client.get<NfsExport>(`/nfs/exports/${name}`)
  return response.data
}

/**
 * 创建 NFS 导出
 */
export async function createNfsExport(client: AxiosInstance, exportConfig: NfsExport): Promise<void> {
  await client.post('/nfs/exports', exportConfig)
}

/**
 * 更新 NFS 导出
 */
export async function updateNfsExport(
  client: AxiosInstance,
  name: string,
  exportConfig: NfsExport
): Promise<void> {
  await client.put(`/nfs/exports/${name}`, exportConfig)
}

/**
 * 删除 NFS 导出
 */
export async function deleteNfsExport(client: AxiosInstance, name: string): Promise<void> {
  await client.delete(`/nfs/exports/${name}`)
}
