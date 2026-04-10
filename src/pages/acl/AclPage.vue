<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold text-gray-900">ACL 管理</h1>
    </div>

    <!-- 路径查询 -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <form @submit.prevent="queryAcl" class="flex gap-3">
        <input
          v-model="queryPath"
          type="text"
          placeholder="输入文件或目录路径，例如 /data/files"
          class="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          :disabled="!queryPath || aclLoading"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {{ aclLoading ? '查询中...' : '查询' }}
        </button>
      </form>
    </div>

    <!-- ACL 结果 -->
    <div v-if="aclData" class="bg-white rounded-lg shadow-md p-6">
      <!-- 基本信息 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <p class="text-xs font-medium text-gray-500 uppercase">路径</p>
          <p class="font-mono text-sm text-gray-900 mt-1">{{ aclData.path }}</p>
        </div>
        <div>
          <p class="text-xs font-medium text-gray-500 uppercase">所有者</p>
          <p class="text-sm text-gray-900 mt-1">{{ aclData.owner }}</p>
        </div>
        <div>
          <p class="text-xs font-medium text-gray-500 uppercase">所属组</p>
          <p class="text-sm text-gray-900 mt-1">{{ aclData.group }}</p>
        </div>
        <div>
          <p class="text-xs font-medium text-gray-500 uppercase">权限位</p>
          <p class="font-mono text-sm text-gray-900 mt-1">{{ aclData.mode.toString(8).padStart(4, '0') }}</p>
        </div>
      </div>

      <!-- ACL 条目 -->
      <div class="mb-4">
        <h3 class="text-base font-semibold text-gray-900 mb-3">ACL 条目</h3>
        <div v-if="aclData.entries.length === 0" class="text-gray-500 text-sm italic">
          暂无 ACL 条目（getfacl 可能未安装）
        </div>
        <table v-else class="min-w-full divide-y divide-gray-200 mb-4">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">主体</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">权限</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="(entry, idx) in aclData.entries" :key="idx">
              <td class="px-4 py-2 text-sm text-gray-600">{{ entry.tag }}</td>
              <td class="px-4 py-2 text-sm font-mono text-gray-900">{{ entry.qualifier || '-' }}</td>
              <td class="px-4 py-2 font-mono text-sm text-gray-900">{{ entry.permissions }}</td>
              <td class="px-4 py-2">
                <button
                  v-if="canWrite"
                  type="button"
                  class="text-red-600 hover:text-red-800 text-sm"
                  @click="removeEntry(idx)"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 添加新条目 -->
      <div v-if="canWrite" class="border-t border-gray-200 pt-4">
        <h4 class="text-sm font-semibold text-gray-700 mb-3">添加 ACL 条目</h4>
        <div class="flex gap-3 items-start">
          <div class="flex-1">
            <input
              v-model="newEntryText"
              type="text"
              placeholder="格式：u:alice:rwx 或 g:devs:r-x 或 o::r--"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              @blur="validateEntry"
            />
            <p v-if="entryError" class="text-red-600 text-xs mt-1">{{ entryError }}</p>
            <p class="text-gray-400 text-xs mt-1">格式：[u|g|o|m]:[qualifier]:[rwx-]{3}，例：u:alice:rwx</p>
          </div>
          <button
            type="button"
            :disabled="!!entryError || !newEntryText"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
            @click="addEntry"
          >
            添加
          </button>
        </div>
      </div>

      <!-- 保存按钮 -->
      <div v-if="canWrite" class="flex justify-end mt-4 pt-4 border-t border-gray-200">
        <button
          type="button"
          :disabled="saveLoading"
          class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          @click="saveAcl"
        >
          {{ saveLoading ? '保存中...' : '保存 ACL' }}
        </button>
      </div>
    </div>

    <div v-else-if="aclError" class="bg-red-50 rounded-lg p-4 text-red-800">{{ aclError }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAgent } from '@/composables/useAgent'
import { useRole } from '@/composables/useRole'
import { useUiStore } from '@/stores/ui'
import { getAcl, setAcl } from '@/api/acl'
import { ACL_ENTRY_REGEX } from '@/utils/constants'
import type { AclResponse, AclEntry } from '@/types'

const { apiClient } = useAgent()
const { canWrite } = useRole()
const uiStore = useUiStore()

const queryPath = ref('')
const aclData = ref<AclResponse | null>(null)
const aclLoading = ref(false)
const aclError = ref<string | null>(null)
const saveLoading = ref(false)

// 新条目
const newEntryText = ref('')
const entryError = ref<string | null>(null)

async function queryAcl() {
  if (!apiClient.value || !queryPath.value) return
  aclLoading.value = true
  aclError.value = null
  aclData.value = null
  try {
    aclData.value = await getAcl(apiClient.value, queryPath.value)
  } catch (e) {
    aclError.value = e instanceof Error ? e.message : '查询失败'
  } finally {
    aclLoading.value = false
  }
}

function validateEntry() {
  if (!newEntryText.value) {
    entryError.value = null
    return
  }
  if (!ACL_ENTRY_REGEX.test(newEntryText.value)) {
    entryError.value = '格式错误，示例：u:alice:rwx'
  } else {
    entryError.value = null
  }
}

function addEntry() {
  validateEntry()
  if (entryError.value || !newEntryText.value || !aclData.value) return
  const parts = newEntryText.value.split(':')
  const tagMap: Record<string, AclEntry['tag']> = { u: 'user', g: 'group', o: 'other', m: 'mask' }
  const entry: AclEntry = {
    tag: tagMap[parts[0] ?? 'u'] ?? 'user',
    qualifier: parts[1] ?? '',
    permissions: parts[2] ?? '---',
  }
  aclData.value.entries.push(entry)
  newEntryText.value = ''
}

function removeEntry(idx: number) {
  aclData.value?.entries.splice(idx, 1)
}

async function saveAcl() {
  if (!apiClient.value || !aclData.value) return
  saveLoading.value = true
  try {
    await setAcl(apiClient.value, {
      path: aclData.value.path,
      entries: aclData.value.entries,
    })
    uiStore.success('ACL 保存成功')
  } catch (e) {
    uiStore.error(e instanceof Error ? e.message : '保存失败')
  } finally {
    saveLoading.value = false
  }
}
</script>

