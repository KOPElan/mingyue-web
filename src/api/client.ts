/**
 * mingyue API 客户端
 * 基于 axios 封装，提供统一的错误处理和认证
 */

import axios from 'axios'
import type { AxiosInstance, AxiosError } from 'axios'
import type { ApiError } from '@/types'
import { ERROR_CODE_MAP, API_TIMEOUT } from '@/utils/constants'

/**
 * API 错误类
 */
export class MingyueApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'MingyueApiError'
  }
}

/**
 * 创建 mingyue API 客户端
 * @param baseUrl API 基础 URL，例如 http://192.168.1.100:7070/api/v1
 * @param apiKey API Key（Bearer Token）
 */
export function createMingyueClient(baseUrl: string, apiKey: string): AxiosInstance {
  const client = axios.create({
    baseURL: baseUrl,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // 请求拦截器：添加认证头
  client.interceptors.request.use(
    (config) => {
      if (apiKey) {
        config.headers.Authorization = `Bearer ${apiKey}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // 响应拦截器：统一错误处理
  client.interceptors.response.use(
    (response) => {
      return response
    },
    (error: AxiosError<ApiError>) => {
      if (error.response?.data) {
        const apiError = error.response.data
        const code = apiError.code || 'INTERNAL'
        const message = ERROR_CODE_MAP[code] || apiError.message || '未知错误'
        
        return Promise.reject(new MingyueApiError(code, message, error))
      }

      // 网络错误或其他错误
      if (error.code === 'ECONNABORTED') {
        return Promise.reject(new MingyueApiError('TIMEOUT', '请求超时，请稍后重试', error))
      }

      if (error.message === 'Network Error') {
        return Promise.reject(
          new MingyueApiError('NETWORK_ERROR', '网络连接失败，请检查 Agent 是否在线', error)
        )
      }

      return Promise.reject(
        new MingyueApiError('UNKNOWN', error.message || '未知错误', error)
      )
    }
  )

  return client
}

/**
 * 创建健康检查客户端（无需认证）
 * @param baseUrl API 基础 URL
 */
export function createHealthCheckClient(baseUrl: string): AxiosInstance {
  return axios.create({
    baseURL: baseUrl,
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
