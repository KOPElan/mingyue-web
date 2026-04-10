<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
      <h2 class="text-lg font-bold mb-4">{{ isEditing ? '编辑' : '创建' }} NFS 导出</h2>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">导出名称</label>
          <input v-model="form.name" type="text" required :readonly="isEditing"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">本地路径</label>
          <input v-model="form.path" type="text" required placeholder="/data/nfs"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">允许客户端（每行一个，例：192.168.1.0/24 rw,sync）</label>
          <textarea v-model="clientsText" rows="3"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
            placeholder="* rw,sync,no_root_squash"
          ></textarea>
        </div>
        <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>
        <div class="flex justify-end gap-3">
          <button type="button" @click="$emit('close')" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700">取消</button>
          <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">确认</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { NfsExport } from '@/types'

const props = defineProps<{
  initial: NfsExport | null
  error: string | null
}>()

const emit = defineEmits<{
  close: []
  submit: [form: NfsExport]
}>()

const isEditing = !!props.initial

const form = reactive({
  name: props.initial?.name ?? '',
  path: props.initial?.path ?? '',
})

const clientsText = ref(
  props.initial?.clients
    .map(c => `${c.host} ${Array.isArray(c.options) ? c.options.join(',') : c.options}`)
    .join('\n') ?? ''
)

function handleSubmit() {
  const clients = clientsText.value
    .split('\n')
    .filter(l => l.trim())
    .map(line => {
      const parts = line.trim().split(/\s+/)
      return { host: parts[0] ?? '*', options: (parts[1] ?? 'rw,sync').split(',') }
    })
  emit('submit', { name: form.name, path: form.path, clients })
}
</script>
