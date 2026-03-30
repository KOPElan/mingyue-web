/**
 * 轮询 Composable
 * 用于定时执行任务
 */

import { ref, onUnmounted } from 'vue'

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
  const timerId = ref<number | null>(null)

  // 开始轮询
  function start() {
    if (isPolling.value) return

    isPolling.value = true

    // 立即执行
    if (immediate) {
      callback()
    }

    // 启动定时器
    timerId.value = window.setInterval(() => {
      callback()
    }, interval)
  }

  // 停止轮询
  function stop() {
    if (!isPolling.value) return

    isPolling.value = false

    if (timerId.value !== null) {
      clearInterval(timerId.value)
      timerId.value = null
    }
  }

  // 重启轮询
  function restart() {
    stop()
    start()
  }

  // 组件卸载时自动停止
  onUnmounted(() => {
    stop()
  })

  return {
    isPolling,
    start,
    stop,
    restart,
  }
}
