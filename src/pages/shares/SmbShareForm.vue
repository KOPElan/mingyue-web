<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
      <h2 class="text-lg font-bold mb-4">{{ isEditing ? '编辑' : '创建' }} Samba 共享</h2>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">共享名称</label>
          <input v-model="form.name" type="text" required :readonly="isEditing"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">本地路径</label>
          <input v-model="form.path" type="text" required placeholder="/data/share"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div class="flex items-center gap-6">
          <label class="flex items-center gap-2 text-sm text-gray-700">
            <input v-model="form.readonly" type="checkbox" class="rounded" /> 只读
          </label>
          <label class="flex items-center gap-2 text-sm text-gray-700">
            <input v-model="form.guestOk" type="checkbox" class="rounded" /> 允许来宾
          </label>
          <label class="flex items-center gap-2 text-sm text-gray-700">
            <input v-model="form.browseable" type="checkbox" class="rounded" /> 可浏览
          </label>
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
import { reactive } from 'vue'
import type { SmbShare } from '@/types'

const props = defineProps<{
  initial: SmbShare | null
  error: string | null
}>()

const emit = defineEmits<{
  close: []
  submit: [form: SmbShare]
}>()

const isEditing = !!props.initial
const form = reactive({
  name: props.initial?.name ?? '',
  path: props.initial?.path ?? '',
  readonly: props.initial?.readonly ?? false,
  guestOk: props.initial?.guestOk ?? false,
  browseable: props.initial?.browseable ?? true,
})

function handleSubmit() {
  emit('submit', { ...form })
}
</script>
