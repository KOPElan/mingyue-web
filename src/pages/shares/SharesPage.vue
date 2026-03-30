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
        <button
          type="button"
          @click="activeTab = 'smb-users'"
          class="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50"
        >
          管理 Samba 用户
        </button>
        <button
          v-if="canWrite"
          type="button"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          @click="openSmbForm(null)"
        >
          创建 Samba 共享
        </button>
      </div>
      <div v-if="smbLoading" class="bg-white rounded-lg shadow-md p-6">
        <SkeletonList :count="3" />
      </div>
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
                <span :class="share.readonly ? 'text-yellow-600' : 'text-green-600'">
                  {{ share.readonly ? '只读' : '读写' }}
                </span>
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
        <button
          v-if="canWrite"
          type="button"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          @click="openNfsForm(null)"
        >
          创建 NFS 导出
        </button>
      </div>
      <div v-if="nfsLoading" class="bg-white rounded-lg shadow-md p-6">
        <SkeletonList :count="3" />
      </div>
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
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ exp.clients.map(c => c.host).join(', ') || '*' }}
              </td>
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
        <button
          v-if="canWrite"
          type="button"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          @click="openUserForm()"
        >
          创建 Samba 用户
        </button>
      </div>
      <div v-if="usersLoading" class="bg-white rounded-lg shadow-md p-6">
        <SkeletonList :count="3" />
      </div>
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
                <span :class="user.enabled ? 'text-green-600' : 'text-red-600'">
                  {{ user.enabled ? '启用' : '禁用' }}
                </span>
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

    <!-- SMB 共享表单模态框 -->
    <div v-if="showSmbForm" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" @click.self="showSmbForm = false">
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <h2 class="text-lg font-bold mb-4">{{ editingSmb ? '编辑' : '创建' }} Samba 共享</h2>
        <form @submit.prevent="submitSmbForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">共享名称</label>
            <input v-model="smbForm.name" type="text" required :readonly="!!editingSmb"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">本地路径</label>
            <input v-model="smbForm.path" type="text" required placeholder="/data/share"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div class="flex items-center gap-6">
            <label class="flex items-center gap-2 text-sm text-gray-700">
              <input v-model="smbForm.readonly" type="checkbox" class="rounded" />
              只读
            </label>
            <label class="flex items-center gap-2 text-sm text-gray-700">
              <input v-model="smbForm.guestOk" type="checkbox" class="rounded" />
              允许来宾
            </label>
            <label class="flex items-center gap-2 text-sm text-gray-700">
              <input v-model="smbForm.browseable" type="checkbox" class="rounded" />
              可浏览
            </label>
          </div>
          <div v-if="smbFormError" class="text-red-600 text-sm">{{ smbFormError }}</div>
          <div class="flex justify-end gap-3">
            <button type="button" @click="showSmbForm = false" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700">取消</button>
            <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">确认</button>
          </div>
        </form>
      </div>
    </div>

    <!-- NFS 导出表单模态框 -->
    <div v-if="showNfsForm" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" @click.self="showNfsForm = false">
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <h2 class="text-lg font-bold mb-4">{{ editingNfs ? '编辑' : '创建' }} NFS 导出</h2>
        <form @submit.prevent="submitNfsForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">导出名称</label>
            <input v-model="nfsForm.name" type="text" required :readonly="!!editingNfs"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">本地路径</label>
            <input v-model="nfsForm.path" type="text" required placeholder="/data/nfs"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">允许客户端（每行一个，例：192.168.1.0/24 rw,sync）</label>
            <textarea v-model="nfsClientsText" rows="3"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
              placeholder="* rw,sync,no_root_squash"
            ></textarea>
          </div>
          <div v-if="nfsFormError" class="text-red-600 text-sm">{{ nfsFormError }}</div>
          <div class="flex justify-end gap-3">
            <button type="button" @click="showNfsForm = false" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700">取消</button>
            <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">确认</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 创建/修改密码 Samba 用户 -->
    <div v-if="showUserForm" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" @click.self="showUserForm = false">
      <div class="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
        <h2 class="text-lg font-bold mb-4">{{ changingPasswordUser ? '修改密码' : '创建 Samba 用户' }}</h2>
        <form @submit.prevent="submitUserForm" class="space-y-4">
          <div v-if="!changingPasswordUser">
            <label class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
            <input v-model="userForm.username" type="text" required
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input v-model="userForm.password" type="password" required
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autocomplete="new-password"
            />
          </div>
          <div class="flex justify-end gap-3">
            <button type="button" @click="showUserForm = false" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700">取消</button>
            <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">确认</button>
          </div>
        </form>
      </div>
    </div>
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

// SMB 数据
const smbShares = ref<SmbShare[]>([])
const smbLoading = ref(false)
const smbError = ref<string | null>(null)

// NFS 数据
const nfsExports = ref<NfsExport[]>([])
const nfsLoading = ref(false)
const nfsError = ref<string | null>(null)

// 用户数据
const smbUsers = ref<SmbUser[]>([])
const usersLoading = ref(false)

// SMB 表单
const showSmbForm = ref(false)
const editingSmb = ref<string | null>(null)
const smbFormError = ref<string | null>(null)
const smbForm = ref({ name: '', path: '', readonly: false, guestOk: false, browseable: true })

// NFS 表单
const showNfsForm = ref(false)
const editingNfs = ref<string | null>(null)
const nfsFormError = ref<string | null>(null)
const nfsForm = ref({ name: '', path: '' })
const nfsClientsText = ref('')

// 用户表单
const showUserForm = ref(false)
const changingPasswordUser = ref<string | null>(null)
const userForm = ref({ username: '', password: '' })

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
  } catch (_e) {
    /* ignore */
  } finally {
    usersLoading.value = false
  }
}

function openSmbForm(share: SmbShare | null) {
  editingSmb.value = share?.name ?? null
  smbFormError.value = null
  if (share) {
    smbForm.value = { name: share.name, path: share.path, readonly: share.readonly, guestOk: share.guestOk, browseable: share.browseable }
  } else {
    smbForm.value = { name: '', path: '', readonly: false, guestOk: false, browseable: true }
  }
  showSmbForm.value = true
}

async function submitSmbForm() {
  if (!apiClient.value) return
  smbFormError.value = null
  try {
    const payload: SmbShare = {
      name: smbForm.value.name,
      path: smbForm.value.path,
      readonly: smbForm.value.readonly,
      guestOk: smbForm.value.guestOk,
      browseable: smbForm.value.browseable,
    }
    if (editingSmb.value) {
      await updateSmbShare(apiClient.value, editingSmb.value, payload)
    } else {
      await createSmbShare(apiClient.value, payload)
    }
    uiStore.success(editingSmb.value ? '共享已更新' : '共享已创建')
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
  editingNfs.value = exp?.name ?? null
  nfsFormError.value = null
  if (exp) {
    nfsForm.value = { name: exp.name, path: exp.path }
    nfsClientsText.value = exp.clients.map(c => `${c.host} ${Array.isArray(c.options) ? c.options.join(',') : c.options}`).join('\n')
  } else {
    nfsForm.value = { name: '', path: '' }
    nfsClientsText.value = ''
  }
  showNfsForm.value = true
}

async function submitNfsForm() {
  if (!apiClient.value) return
  nfsFormError.value = null
  const clients = nfsClientsText.value.split('\n').filter(l => l.trim()).map(line => {
    const parts = line.trim().split(/\s+/)
    return { host: parts[0] ?? '*', options: (parts[1] ?? 'rw,sync').split(',') }
  })
  const payload: NfsExport = {
    name: nfsForm.value.name,
    path: nfsForm.value.path,
    clients,
  }
  try {
    if (editingNfs.value) {
      await updateNfsExport(apiClient.value, editingNfs.value, payload)
    } else {
      await createNfsExport(apiClient.value, payload)
    }
    uiStore.success(editingNfs.value ? '导出已更新' : '导出已创建')
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
  userForm.value = { username: '', password: '' }
  showUserForm.value = true
}

function openChangePassword(username: string) {
  changingPasswordUser.value = username
  userForm.value = { username, password: '' }
  showUserForm.value = true
}

async function submitUserForm() {
  if (!apiClient.value) return
  try {
    if (changingPasswordUser.value) {
      await updateSmbUserPassword(apiClient.value, changingPasswordUser.value, { password: userForm.value.password })
      uiStore.success('密码已修改')
    } else {
      await createSmbUser(apiClient.value, userForm.value.username, userForm.value.password)
      uiStore.success('用户已创建')
    }
    // 立即清除密码 state
    userForm.value.password = ''
    showUserForm.value = false
    await loadSmbUsers()
  } catch (e) {
    uiStore.error(e instanceof Error ? e.message : '操作失败')
    userForm.value.password = ''
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

