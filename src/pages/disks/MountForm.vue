<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-bold">新建挂载</h2>
        <button type="button" @click="$emit('close')" class="text-gray-400 hover:text-gray-600">✕</button>
      </div>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">挂载类型</label>
          <select v-model="form.fstype" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="ext4">本地 (ext4)</option>
            <option value="xfs">本地 (xfs)</option>
            <option value="btrfs">本地 (btrfs)</option>
            <option value="ntfs">本地 (ntfs)</option>
            <option value="vfat">本地 (vfat)</option>
            <option value="cifs">CIFS / Samba</option>
            <option value="nfs">NFS</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">源设备/路径</label>
          <input v-model="form.device" type="text" required
            :placeholder="form.fstype === 'cifs' ? '//server/share' : form.fstype === 'nfs' ? 'server:/export' : '/dev/sdX'"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">挂载目标路径</label>
          <input v-model="form.mountpoint" type="text" required placeholder="/mnt/data"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <!-- CIFS 专用字段 -->
        <template v-if="form.fstype === 'cifs'">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
            <input v-model="form.username" type="text"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input v-model="form.password" type="password"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </template>
        <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>
        <div class="flex justify-end gap-3">
          <button type="button" @click="$emit('close')" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">取消</button>
          <button type="submit" :disabled="loading" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
            {{ loading ? '挂载中...' : '确认挂载' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  close: []
  submit: [form: { device: string; mountpoint: string; fstype: string; username?: string; password?: string }]
}>()

defineProps<{
  loading: boolean
  error: string | null
}>()

const form = ref({
  device: '',
  mountpoint: '',
  fstype: 'ext4',
  username: '',
  password: '',
})

function handleSubmit() {
  const payload = {
    device: form.value.device,
    mountpoint: form.value.mountpoint,
    fstype: form.value.fstype,
    username: form.value.username || undefined,
    password: form.value.password || undefined,
  }
  emit('submit', payload)
  // 立即清除 CIFS 凭据，不持久化
  form.value.password = ''
  form.value.username = ''
}
</script>
