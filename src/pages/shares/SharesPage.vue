<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold text-gray-900">共享管理</h1>
    </div>

    <!-- 标签页 -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
            activeTab === tab.id
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
          ]"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- SMB 共享 -->
    <div v-if="activeTab === 'smb'">
      <div class="flex justify-end mb-4 gap-3">
        <button type="button" @click="activeTab = 'smb-users'"
          class="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50"
        >管理 Samba 用户</button>
        <button v-if="canWrite" type="button" @click="openSmbForm(null)"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >创建 Samba 共享</button>
      </div>
      <div v-if="smbLoading" class="bg-white rounded-lg shadow-md p-6"><SkeletonList :count="3" /></div>
      <div v-else-if="smbError" class="bg-red-50 rounded-lg p-4 text-red-800">{{ smbError }}</div>
      <div v-else-if="smbShares.length === 0" class="bg-white rounded-lg shadow-md p-8">
        <EmptyState title="暂无 Samba 共享" description="" />
      </div>
      <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">名称</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">路径</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">访问</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">来宾</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="share in smbShares" :key="share.name">
              <td class="px-6 py-4 font-medium text-sm text-gray-900">{{ share.name }}</td>
              <td class="px-6 py-4 font-mono text-sm text-gray-600">{{ share.path }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="share.readonly ? 'text-yellow-600' : 'text-green-600'">{{ share.readonly ? '只读' : '读写' }}</span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ share.guestOk ? '允许' : '禁止' }}</td>
              <td class="px-6 py-4 text-sm flex gap-3">
                <button v-if="canWrite" type="button" class="text-indigo-600 hover:text-indigo-800" @click="openSmbForm(share)">编辑</button>
                <button v-if="canWrite" type="button" class="text-red-600 hover:text-red-800" @click="handleDeleteSmb(share.name)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- NFS 导出 -->
    <div v-if="activeTab === 'nfs'">
      <div class="flex justify-end mb-4">
        <button v-if="canWrite" type="button" @click="openNfsForm(null)"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >创建 NFS 导出</button>
      </div>
      <div v-if="nfsLoading" class="bg-white rounded-lg shadow-md p-6"><SkeletonList :count="3" /></div>
      <div v-else-if="nfsError" class="bg-red-50 rounded-lg p-4 text-red-800">{{ nfsError }}</div>
      <div v-else-if="nfsExports.length === 0" class="bg-white rounded-lg shadow-md p-8">
        <EmptyState title="暂无 NFS 导出" description="" />
      </div>
      <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">名称</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">路径</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">客户端</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="exp in nfsExports" :key="exp.name">
              <td class="px-6 py-4 font-medium text-sm text-gray-900">{{ exp.name }}</td>
              <td class="px-6 py-4 font-mono text-sm text-gray-600">{{ exp.path }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ exp.clients.map(c => c.host).join(', ') || '*' }}</td>
              <td class="px-6 py-4 text-sm flex gap-3">
                <button v-if="canWrite" type="button" class="text-indigo-600 hover:text-indigo-800" @click="openNfsForm(exp)">编辑</button>
                <button v-if="canWrite" type="button" class="text-red-600 hover:text-red-800" @click="handleDeleteNfs(exp.name)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Samba 用户管理 -->
    <div v-if="activeTab === 'smb-users'">
      <div class="flex justify-end mb-4">
        <button v-if="canWrite" type="button" @click="openUserForm()"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >创建 Samba 用户</button>
      </div>
      <div v-if="usersLoading" class="bg-white rounded-lg shadow-md p-6"><SkeletonList :count="3" /></div>
      <div v-else-if="smbUsers.length === 0" class="bg-white rounded-lg shadow-md p-8">
        <EmptyState title="暂无 Samba 用户" description="" />
      </div>
      <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户名</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in smbUsers" :key="user.username">
              <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ user.username }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="user.enabled ? 'text-green-600' : 'text-red-600'">{{ user.enabled ? '启用' : '禁用' }}</span>
              </td>
              <td class="px-6 py-4 text-sm flex gap-3">
                <button v-if="canWrite" type="button" class="text-indigo-600 hover:text-indigo-800" @click="openChangePassword(user.username)">修改密码</button>
                <button v-if="canWrite" type="button" class="text-red-600 hover:text-red-800" @click="handleDeleteUser(user.username)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 模态框：使用拆分出的子组件 -->
    <SmbShareForm
      v-if="showSmbForm"
      :initial="editingSmbShare"
      :error="smbFormError"
      @close="showSmbForm = false"
      @submit="submitSmbForm"
    />
    <NfsExportForm
      v-if="showNfsForm"
      :initial="editingNfsExport"
      :error="nfsFormError"
      @close="showNfsForm = false"
      @submit="submitNfsForm"
    />
    <SmbUserForm
      v-if="showUserForm"
      :username="changingPasswordUser"
      @close="showUserForm = false"
      @submit="submitUserForm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAgent } from '@/composables/useAgent'
import { useRole } from '@/composables/useRole'
import { useConfirm } from '@/composables/useConfirm'
import { useUiStore } from '@/stores/ui'
import {
  getSmbShares, createSmbShare, updateSmbShare, deleteSmbShare,
  getSmbUsers, createSmbUser, updateSmbUserPassword, deleteSmbUser,
} from '@/api/smb'
import { getNfsExports, createNfsExport, updateNfsExport, deleteNfsExport } from '@/api/nfs'
import SkeletonList from '@/components/common/SkeletonList.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SmbShareForm from './SmbShareForm.vue'
import NfsExportForm from './NfsExportForm.vue'
import SmbUserForm from './SmbUserForm.vue'
import type { SmbShare, SmbUser, NfsExport } from '@/types'

const { apiClient } = useAgent()
const { canWrite } = useRole()
const { confirm } = useConfirm()
const uiStore = useUiStore()

const tabs = [
  { id: 'smb', label: 'Samba 共享' },
  { id: 'nfs', label: 'NFS 导出' },
  { id: 'smb-users', label: 'Samba 用户' },
]
const activeTab = ref('smb')

const smbShares = ref<SmbShare[]>([])
const smbLoading = ref(false)
const smbError = ref<string | null>(null)

const nfsExports = ref<NfsExport[]>([])
const nfsLoading = ref(false)
const nfsError = ref<string | null>(null)

const smbUsers = ref<SmbUser[]>([])
const usersLoading = ref(false)

// 表单可见性与编辑状态
const showSmbForm = ref(false)
const editingSmbShare = ref<SmbShare | null>(null)
const smbFormError = ref<string | null>(null)

const showNfsForm = ref(false)
const editingNfsExport = ref<NfsExport | null>(null)
const nfsFormError = ref<string | null>(null)

const showUserForm = ref(false)
const changingPasswordUser = ref<string | null>(null)

async function loadSmbShares() {
  if (!apiClient.value) return
  smbLoading.value = true
  try {
    smbShares.value = await getSmbShares(apiClient.value)
  } catch (e) {
    smbError.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    smbLoading.value = false
  }
}

async function loadNfsExports() {
  if (!apiClient.value) return
  nfsLoading.value = true
  try {
    nfsExports.value = await getNfsExports(apiClient.value)
  } catch (e) {
    nfsError.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    nfsLoading.value = false
  }
}

async function loadSmbUsers() {
  if (!apiClient.value) return
  usersLoading.value = true
  try {
    smbUsers.value = await getSmbUsers(apiClient.value)
  } catch {
    /* ignore */
  } finally {
    usersLoading.value = false
  }
}

function openSmbForm(share: SmbShare | null) {
  editingSmbShare.value = share
  smbFormError.value = null
  showSmbForm.value = true
}

async function submitSmbForm(form: SmbShare) {
  if (!apiClient.value) return
  smbFormError.value = null
  try {
    if (editingSmbShare.value) {
      await updateSmbShare(apiClient.value, editingSmbShare.value.name, form)
    } else {
      await createSmbShare(apiClient.value, form)
    }
    uiStore.success(editingSmbShare.value ? '共享已更新' : '共享已创建')
    showSmbForm.value = false
    await loadSmbShares()
  } catch (e) {
    smbFormError.value = e instanceof Error ? e.message : '操作失败'
  }
}

async function handleDeleteSmb(name: string) {
  const confirmed = await confirm({
    title: '删除共享',
    message: `确认删除 Samba 共享 "${name}"？`,
    confirmText: '删除',
    cancelText: '取消',
    type: 'danger',
  })
  if (!confirmed || !apiClient.value) return
  try {
    await deleteSmbShare(apiClient.value, name)
    uiStore.success('共享已删除')
    await loadSmbShares()
  } catch (e) {
    uiStore.error(e instanceof Error ? e.message : '删除失败')
  }
}

function openNfsForm(exp: NfsExport | null) {
  editingNfsExport.value = exp
  nfsFormError.value = null
  showNfsForm.value = true
}

async function submitNfsForm(form: NfsExport) {
  if (!apiClient.value) return
  nfsFormError.value = null
  try {
    if (editingNfsExport.value) {
      await updateNfsExport(apiClient.value, editingNfsExport.value.name, form)
    } else {
      await createNfsExport(apiClient.value, form)
    }
    uiStore.success(editingNfsExport.value ? '导出已更新' : '导出已创建')
    showNfsForm.value = false
    await loadNfsExports()
  } catch (e) {
    nfsFormError.value = e instanceof Error ? e.message : '操作失败'
  }
}

async function handleDeleteNfs(name: string) {
  const confirmed = await confirm({
    title: '删除 NFS 导出',
    message: `确认删除 NFS 导出 "${name}"？`,
    confirmText: '删除',
    cancelText: '取消',
    type: 'danger',
  })
  if (!confirmed || !apiClient.value) return
  try {
    await deleteNfsExport(apiClient.value, name)
    uiStore.success('NFS 导出已删除')
    await loadNfsExports()
  } catch (e) {
    uiStore.error(e instanceof Error ? e.message : '删除失败')
  }
}

function openUserForm() {
  changingPasswordUser.value = null
  showUserForm.value = true
}

function openChangePassword(username: string) {
  changingPasswordUser.value = username
  showUserForm.value = true
}

async function submitUserForm(payload: { username: string; password: string }) {
  if (!apiClient.value) return
  try {
    if (changingPasswordUser.value) {
      await updateSmbUserPassword(apiClient.value, changingPasswordUser.value, { password: payload.password })
      uiStore.success('密码已修改')
    } else {
      await createSmbUser(apiClient.value, payload.username, payload.password)
      uiStore.success('用户已创建')
    }
    showUserForm.value = false
    await loadSmbUsers()
  } catch (e) {
    uiStore.error(e instanceof Error ? e.message : '操作失败')
  }
}

async function handleDeleteUser(username: string) {
  const confirmed = await confirm({
    title: '删除用户',
    message: `确认删除 Samba 用户 "${username}"？`,
    confirmText: '删除',
    cancelText: '取消',
    type: 'danger',
  })
  if (!confirmed || !apiClient.value) return
  try {
    await deleteSmbUser(apiClient.value, username)
    uiStore.success('用户已删除')
    await loadSmbUsers()
  } catch (e) {
    uiStore.error(e instanceof Error ? e.message : '删除失败')
  }
}

onMounted(async () => {
  await Promise.all([loadSmbShares(), loadNfsExports(), loadSmbUsers()])
})
</script>
