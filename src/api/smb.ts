/**
 * Samba 共享管理 API
 */

import type { AxiosInstance } from 'axios'
import type { SmbShare, SmbUser, SmbUserPasswordRequest } from '@/types'

/**
 * 获取 Samba 共享列表
 */
export async function getSmbShares(client: AxiosInstance): Promise<SmbShare[]> {
  const response = await client.get<{ shares: SmbShare[] }>('/smb/shares')
  return response.data.shares
}

/**
 * 获取单个 Samba 共享
 */
export async function getSmbShare(client: AxiosInstance, name: string): Promise<SmbShare> {
  const response = await client.get<SmbShare>(`/smb/shares/${name}`)
  return response.data
}

/**
 * 创建 Samba 共享
 */
export async function createSmbShare(client: AxiosInstance, share: SmbShare): Promise<void> {
  await client.post('/smb/shares', share)
}

/**
 * 更新 Samba 共享
 */
export async function updateSmbShare(
  client: AxiosInstance,
  name: string,
  share: SmbShare
): Promise<void> {
  await client.put(`/smb/shares/${name}`, share)
}

/**
 * 删除 Samba 共享
 */
export async function deleteSmbShare(client: AxiosInstance, name: string): Promise<void> {
  await client.delete(`/smb/shares/${name}`)
}

/**
 * 获取 Samba 用户列表
 */
export async function getSmbUsers(client: AxiosInstance): Promise<SmbUser[]> {
  const response = await client.get<{ users: SmbUser[] }>('/smb/users')
  return response.data.users
}

/**
 * 创建 Samba 用户
 */
export async function createSmbUser(
  client: AxiosInstance,
  username: string,
  password: string
): Promise<void> {
  await client.post('/smb/users', { username, password })
}

/**
 * 更新 Samba 用户密码
 */
export async function updateSmbUserPassword(
  client: AxiosInstance,
  username: string,
  request: SmbUserPasswordRequest
): Promise<void> {
  await client.put(`/smb/users/${username}/password`, request)
}

/**
 * 删除 Samba 用户
 */
export async function deleteSmbUser(client: AxiosInstance, username: string): Promise<void> {
  await client.delete(`/smb/users/${username}`)
}
