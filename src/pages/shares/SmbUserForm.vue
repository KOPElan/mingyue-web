<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
      <h2 class="text-lg font-bold mb-4">{{ username ? '修改密码' : '创建 Samba 用户' }}</h2>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div v-if="!username">
          <label class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
          <input v-model="form.username" type="text" required
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input v-model="form.password" type="password" required
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autocomplete="new-password"
          />
        </div>
        <div class="flex justify-end gap-3">
          <button type="button" @click="$emit('close')" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700">取消</button>
          <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">确认</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const props = defineProps<{
  /** 传入用户名时为"修改密码"模式，null 为"创建用户"模式 */
  username: string | null
}>()

const emit = defineEmits<{
  close: []
  submit: [payload: { username: string; password: string }]
}>()

const form = reactive({
  username: props.username ?? '',
  password: '',
})

function handleSubmit() {
  emit('submit', { username: form.username, password: form.password })
  // 立即清除密码 state，不持久化
  form.password = ''
}
</script>
