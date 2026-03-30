/**
 * UI Store
 * 管理全局 UI 状态：加载状态、Toast 消息等
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Toast } from '@/types'
import { TOAST_DURATION } from '@/utils/constants'

export const useUiStore = defineStore('ui', () => {
  // 全局加载状态
  const globalLoading = ref(false)

  // Toast 消息队列
  const toasts = ref<Toast[]>([])

  // Toast ID 计数器
  let toastIdCounter = 0

  // 设置全局加载状态
  function setGlobalLoading(loading: boolean) {
    globalLoading.value = loading
  }

  // 显示 Toast
  function showToast(
    type: Toast['type'],
    message: string,
    duration: number = TOAST_DURATION
  ) {
    const id = `toast-${++toastIdCounter}`
    const toast: Toast = {
      id,
      type,
      message,
      duration,
    }

    toasts.value.push(toast)

    // 自动移除
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  // 移除 Toast
  function removeToast(id: string) {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index >= 0) {
      toasts.value.splice(index, 1)
    }
  }

  // 便捷方法
  function success(message: string, duration?: number) {
    return showToast('success', message, duration)
  }

  function error(message: string, duration?: number) {
    return showToast('error', message, duration)
  }

  function warning(message: string, duration?: number) {
    return showToast('warning', message, duration)
  }

  function info(message: string, duration?: number) {
    return showToast('info', message, duration)
  }

  // 清除所有 Toast
  function clearToasts() {
    toasts.value = []
  }

  return {
    // 状态
    globalLoading,
    toasts,

    // 方法
    setGlobalLoading,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
    clearToasts,
  }
})
