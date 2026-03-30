/**
 * 文件管理 API
 */

import type { AxiosInstance } from 'axios'
import type { FileEntry, FileStat, FileReadResponse, FileWriteRequest, FileOperationRequest } from '@/types'

/**
 * 列出目录内容
 */
export async function listFiles(client: AxiosInstance, path: string): Promise<FileEntry[]> {
  const response = await client.get<{ files: FileEntry[] }>('/files', {
    params: { path },
  })
  return response.data.files
}

/**
 * 获取文件/目录详细信息
 */
export async function getFileStat(client: AxiosInstance, path: string): Promise<FileStat> {
  const response = await client.get<FileStat>('/files/stat', {
    params: { path },
  })
  return response.data
}

/**
 * 读取文件内容（Base64）
 */
export async function readFile(client: AxiosInstance, path: string): Promise<FileReadResponse> {
  const response = await client.get<FileReadResponse>('/files/read', {
    params: { path },
  })
  return response.data
}

/**
 * 写入文件内容
 */
export async function writeFile(client: AxiosInstance, request: FileWriteRequest): Promise<void> {
  await client.post('/files', request)
}

/**
 * 移动文件
 */
export async function moveFile(client: AxiosInstance, request: FileOperationRequest): Promise<void> {
  await client.put('/files/move', request)
}

/**
 * 复制文件
 */
export async function copyFile(client: AxiosInstance, request: FileOperationRequest): Promise<void> {
  await client.put('/files/copy', request)
}

/**
 * 删除文件/目录
 */
export async function deleteFile(client: AxiosInstance, path: string): Promise<void> {
  await client.delete('/files', {
    params: { path },
  })
}
