/**
 * Auth Store
 * 管理 API Key 和认证状态
 * 注意：此 store 已废弃，认证信息现在存储在 AgentConfig 中
 * 保留此文件仅用于向后兼容
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'mingyue-api-key'
const TRUSTED_DEVICE_KEY = 'mingyue-trusted-device'

export const useAuthStore = defineStore('auth', () => {
  const apiKey = ref<string | null>(null)
  const isTrustedDevice = ref(false)

  // 加载 API Key
  function loadApiKey(): string | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        apiKey.value = stored
        return stored
      }
    } catch (error) {
      console.error('加载 API Key 失败:', error)
    }
    return null
  }

  // 保存 API Key
  function saveApiKey(key: string, trustDevice = false) {
    apiKey.value = key
    isTrustedDevice.value = trustDevice

    if (trustDevice) {
      try {
        localStorage.setItem(STORAGE_KEY, key)
        localStorage.setItem(TRUSTED_DEVICE_KEY, 'true')
      } catch (error) {
        console.error('保存 API Key 失败:', error)
      }
    } else {
      // 不信任设备时，仅保存到内存
      clearStoredApiKey()
    }
  }

  // 清除 API Key
  function clearApiKey() {
    apiKey.value = null
    isTrustedDevice.value = false
    clearStoredApiKey()
  }

  // 清除存储的 API Key
  function clearStoredApiKey() {
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(TRUSTED_DEVICE_KEY)
    } catch (error) {
      console.error('清除 API Key 失败:', error)
    }
  }

  // 检查是否已配置
  function isConfigured(): boolean {
    return !!apiKey.value
  }

  // 加载信任设备状态
  function loadTrustedDeviceStatus() {
    try {
      const trusted = localStorage.getItem(TRUSTED_DEVICE_KEY)
      isTrustedDevice.value = trusted === 'true'
    } catch (error) {
      console.error('加载信任设备状态失败:', error)
    }
  }

  return {
    apiKey,
    isTrustedDevice,
    loadApiKey,
    saveApiKey,
    clearApiKey,
    isConfigured,
    loadTrustedDeviceStatus,
  }
})
