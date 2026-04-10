/**
 * 轮询 Composable
 * 支持标签页不可见时自动暂停，避免异步回调重叠执行
 */

import { ref, watch, onUnmounted } from 'vue'
import { useDocumentVisibility, useIntervalFn } from '@vueuse/core'

export interface UsePollingOptions {
  interval?: number // 轮询间隔（毫秒）
  immediate?: boolean // 是否立即执行
}

export function usePolling(
  callback: () => void | Promise<void>,
  options: UsePollingOptions = {}
) {
  const { interval = 5000, immediate = true } = options

  const isPolling = ref(false)
  const isRunning = ref(false) // 防止并发重叠执行
  const visibility = useDocumentVisibility()

  // 安全执行：上一次未完成时跳过
  async function safeExecute() {
    if (isRunning.value) return
    isRunning.value = true
    try {
      await callback()
    } finally {
      isRunning.value = false
    }
  }

  const { pause, resume } = useIntervalFn(
    () => {
      // 标签页不可见时跳过本轮执行
      if (visibility.value === 'hidden') return
      safeExecute()
    },
    interval,
    { immediate: false }
  )

  // 监听标签页可见性变化：变可见时立即补一次轮询
  const stopWatcher = watch(visibility, (vis) => {
    if (vis === 'visible' && isPolling.value) {
      safeExecute()
    }
  })

  function start() {
    if (isPolling.value) return
    isPolling.value = true
    if (immediate) {
      safeExecute()
    }
    resume()
  }

  function stop() {
    if (!isPolling.value) return
    isPolling.value = false
    pause()
  }

  function restart() {
    stop()
    start()
  }

  onUnmounted(() => {
    stop()
    stopWatcher()
  })

  return {
    isPolling,
    start,
    stop,
    restart,
  }
}
