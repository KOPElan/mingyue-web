/**
 * Confirm Composable
 * 提供确认对话框功能
 */

import { ref } from 'vue'
import type { ConfirmOptions } from '@/types'

const isOpen = ref(false)
const options = ref<ConfirmOptions>({
  title: '',
  message: '',
  confirmText: '确认',
  cancelText: '取消',
  type: 'info',
})

let resolveCallback: ((value: boolean) => void) | null = null

export function useConfirm() {
  // 显示确认对话框
  function confirm(opts: ConfirmOptions): Promise<boolean> {
    options.value = {
      confirmText: '确认',
      cancelText: '取消',
      type: 'info',
      ...opts,
    }
    isOpen.value = true

    return new Promise<boolean>((resolve) => {
      resolveCallback = resolve
    })
  }

  // 确认
  function handleConfirm() {
    isOpen.value = false
    if (resolveCallback) {
      resolveCallback(true)
      resolveCallback = null
    }
  }

  // 取消
  function handleCancel() {
    isOpen.value = false
    if (resolveCallback) {
      resolveCallback(false)
      resolveCallback = null
    }
  }

  return {
    isOpen,
    options,
    confirm,
    handleConfirm,
    handleCancel,
  }
}
