/**
 * 网络管理 API
 */

import type { AxiosInstance } from 'axios'
import type { NetworkInterface, NetworkInterfaceUpdateRequest } from '@/types'

/**
 * 获取网络接口列表
 */
export async function getNetworkInterfaces(client: AxiosInstance): Promise<NetworkInterface[]> {
  const response = await client.get<{ interfaces: NetworkInterface[] }>('/network/interfaces')
  return response.data.interfaces
}

/**
 * 获取单个网络接口
 */
export async function getNetworkInterface(
  client: AxiosInstance,
  name: string
): Promise<NetworkInterface> {
  const response = await client.get<NetworkInterface>(`/network/interfaces/${name}`)
  return response.data
}

/**
 * 更新网络接口配置
 * 注意：此操作需要 admin 角色
 */
export async function updateNetworkInterface(
  client: AxiosInstance,
  name: string,
  request: NetworkInterfaceUpdateRequest
): Promise<void> {
  await client.put(`/network/interfaces/${name}`, request)
}
