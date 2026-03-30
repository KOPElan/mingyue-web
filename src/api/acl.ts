/**
 * ACL 管理 API
 */

import type { AxiosInstance } from 'axios'
import type { AclResponse, AclSetRequest } from '@/types'

/**
 * 获取文件/目录的 ACL
 */
export async function getAcl(client: AxiosInstance, path: string): Promise<AclResponse> {
  const response = await client.get<AclResponse>('/acl', {
    params: { path },
  })
  return response.data
}

/**
 * 设置文件/目录的 ACL
 */
export async function setAcl(client: AxiosInstance, request: AclSetRequest): Promise<void> {
  await client.put('/acl', request)
}
