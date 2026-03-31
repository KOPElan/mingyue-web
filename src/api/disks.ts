/**
 * 磁盘管理 API
 */

import type { AxiosInstance } from 'axios'
import type { DiskDevice, MountPoint, MountRequest, SmartHealth, DiskPowerStatus } from '@/types'
import { encodeMountPath } from '@/utils/encoding'

/**
 * 获取磁盘设备列表
 */
export async function getDiskDevices(client: AxiosInstance): Promise<DiskDevice[]> {
  const response = await client.get<{ devices: DiskDevice[] }>('/disks/devices')
  return response.data.devices
}

/**
 * 获取挂载点列表
 */
export async function getMountPoints(client: AxiosInstance): Promise<MountPoint[]> {
  const response = await client.get<{ mounts: MountPoint[] }>('/disks/mounts')
  return response.data.mounts
}

/**
 * 挂载设备
 */
export async function mountDevice(client: AxiosInstance, request: MountRequest): Promise<void> {
  await client.post('/disks/mounts', request)
}

/**
 * 卸载设备
 */
export async function unmountDevice(client: AxiosInstance, mountpoint: string): Promise<void> {
  const encodedPath = encodeMountPath(mountpoint)
  await client.delete(`/disks/mounts/${encodedPath}`)
}

/**
 * 获取 SMART 健康信息
 */
export async function getSmartHealth(client: AxiosInstance, device: string): Promise<SmartHealth> {
  const response = await client.get<SmartHealth>(`/disks/${device}/smart`)
  return response.data
}

/**
 * 获取磁盘电源状态
 */
export async function getDiskPowerStatus(
  client: AxiosInstance,
  device: string
): Promise<DiskPowerStatus> {
  const response = await client.get<DiskPowerStatus>(`/disks/${device}/power`)
  return response.data
}

/**
 * 设置磁盘电源状态
 */
export async function setDiskPowerStatus(
  client: AxiosInstance,
  device: string,
  state: 'standby' | 'sleep'
): Promise<void> {
  await client.post(`/disks/${device}/power`, { state })
}
