<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        @click.self="handleCancel"
      >
        <div
          class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="dialogTitleId"
        >
          <!-- 头部 -->
          <div class="px-6 py-4 border-b">
            <h3
              :id="dialogTitleId"
              class="text-lg font-semibold text-gray-900"
            >
              {{ options.title }}
            </h3>
          </div>

          <!-- 内容 -->
          <div class="px-6 py-4">
            <p class="text-gray-700">{{ options.message }}</p>
          </div>

          <!-- 按钮 -->
          <div class="px-6 py-4 border-t flex justify-end gap-3">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              @click="handleCancel"
              @keydown.enter="handleCancel"
            >
              {{ options.cancelText }}
            </button>
            <button
              type="button"
              :class="[
                'px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2',
                options.type === 'danger'
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  : options.type === 'warning'
                    ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
              ]"
              @click="handleConfirm"
              @keydown.enter="handleConfirm"
              autofocus
            >
              {{ options.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useConfirm } from '@/composables/useConfirm'
import { onMounted, onUnmounted, ref } from 'vue'

const { isOpen, options, handleConfirm, handleCancel } = useConfirm()

// 使用稳定唯一 ID，避免 title 含空格/特殊字符导致无效 ID
let idCounter = 0
const dialogTitleId = ref(`confirm-dialog-title-${++idCounter}`)

// 键盘事件处理
function handleKeydown(e: KeyboardEvent) {
  if (!isOpen.value) return
  
  if (e.key === 'Escape') {
    handleCancel()
  } else if (e.key === 'Enter' && e.ctrlKey) {
    handleConfirm()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.2s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.95);
}
</style>
