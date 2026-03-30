<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold text-gray-900">文件管理器</h1>
      <div class="flex gap-3">
        <button
          type="button"
          disabled
          title="上传功能将在后续版本支持（需服务端 multipart 接口）"
          class="px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
        >
          上传文件（暂不支持）
        </button>
      </div>
    </div>

    <div class="flex gap-4 h-[calc(100vh-220px)] bg-white rounded-lg shadow-md overflow-hidden">
      <!-- 左侧目录树 -->
      <div class="w-72 border-r border-gray-200 overflow-y-auto flex-shrink-0">
        <div class="p-3 border-b border-gray-200 bg-gray-50">
          <span class="text-sm font-medium text-gray-700">目录树</span>
        </div>
        <div v-if="treeLoading" class="p-4">
          <SkeletonList :count="5" />
        </div>
        <div v-else class="py-2">
          <DirectoryTreeNode
            v-for="node in treeNodes"
            :key="node.path"
            :node="node"
            :selected-path="currentPath"
            @select="selectDirectory"
          />
        </div>
      </div>

      <!-- 右侧文件列表 + 预览 -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- 路径导航 -->
        <div class="p-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <span class="text-sm text-gray-500">当前路径：</span>
          <span class="text-sm font-mono font-medium text-gray-900">{{ currentPath }}</span>
        </div>

        <div class="flex-1 flex overflow-hidden">
          <!-- 文件列表 -->
          <div :class="['overflow-y-auto', selectedFile ? 'w-1/2 border-r border-gray-200' : 'flex-1']">
            <div v-if="filesLoading" class="p-4">
              <SkeletonList :count="8" />
            </div>
            <div v-else-if="filesError" class="p-4 text-red-600 text-sm">{{ filesError }}</div>
            <div v-else-if="files.length === 0" class="p-8">
              <EmptyState title="此目录为空" description="" />
            </div>
            <table v-else class="min-w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">名称</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">大小</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">修改时间</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">权限</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="file in files"
                  :key="file.path"
                  class="hover:bg-gray-50 cursor-pointer"
                  :class="selectedFile?.path === file.path ? 'bg-indigo-50' : ''"
                  @click="handleFileClick(file)"
                  draggable="true"
                  @dragstart="handleDragStart($event, file)"
                  @dragover.prevent
                  @drop="handleDrop($event, file)"
                >
                  <td class="px-4 py-2">
                    <div class="flex items-center gap-2">
                      <span class="text-lg">{{ file.isDir ? '📁' : getFileIcon(file.name) }}</span>
                      <span class="text-sm text-gray-900">{{ file.name }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-2 text-sm text-gray-600">{{ file.isDir ? '-' : formatBytes(file.size) }}</td>
                  <td class="px-4 py-2 text-sm text-gray-600">{{ formatDate(file.modTime) }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-gray-600">{{ formatMode(file.mode) }}</td>
                  <td class="px-4 py-2">
                    <button
                      v-if="canWrite"
                      type="button"
                      class="text-red-600 hover:text-red-800 text-sm"
                      @click.stop="handleDelete(file)"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 文件预览/编辑 -->
          <div v-if="selectedFile" class="w-1/2 flex flex-col overflow-hidden">
            <div class="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700 truncate">{{ selectedFile.name }}</span>
              <div class="flex gap-2">
                <button
                  v-if="canWrite && !selectedFile.isDir && canPreview"
                  type="button"
                  class="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                  @click="saveFile"
                  :disabled="saveLoading"
                >
                  {{ saveLoading ? '保存中...' : '保存' }}
                </button>
                <button type="button" class="text-gray-400 hover:text-gray-600 text-sm" @click="selectedFile = null">✕</button>
              </div>
            </div>
            <div class="flex-1 overflow-auto p-4">
              <div v-if="previewLoading" class="py-4">
                <SkeletonList :count="6" />
              </div>
              <div v-else-if="!canPreview" class="text-center py-8 text-gray-500">
                <p class="text-2xl mb-2">📦</p>
                <p>文件过大，仅支持下载</p>
                <p class="text-sm mt-1">文件大小: {{ formatBytes(selectedFile.size) }}</p>
              </div>
              <textarea
                v-else
                v-model="fileContent"
                class="w-full h-full min-h-64 font-mono text-sm border border-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-indigo-400 resize-none"
                :readonly="!canWrite"
              ></textarea>
            </div>
          </div>
        </div>
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
import { listFiles, readFile, writeFile, deleteFile, moveFile } from '@/api/files'
import { decodeBase64, encodeBase64 } from '@/utils/base64'
import { FILE_PREVIEW_LIMIT } from '@/utils/constants'
import SkeletonList from '@/components/common/SkeletonList.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import type { FileEntry } from '@/types'

// 目录树节点类型
interface TreeNode {
  name: string
  path: string
  children: TreeNode[]
  expanded: boolean
}

const { apiClient } = useAgent()
const { canWrite } = useRole()
const { confirm } = useConfirm()
const uiStore = useUiStore()

const currentPath = ref('/')
const files = ref<FileEntry[]>([])
const filesLoading = ref(false)
const filesError = ref<string | null>(null)
const selectedFile = ref<FileEntry | null>(null)
const fileContent = ref('')
const previewLoading = ref(false)
const canPreview = ref(false)
const saveLoading = ref(false)
const treeLoading = ref(false)

// 简单目录树
const treeNodes = ref<TreeNode[]>([
  { name: '/', path: '/', children: [], expanded: true },
])

// 目录树节点组件（内联递归）
const DirectoryTreeNode = {
  name: 'DirectoryTreeNode',
  props: {
    node: Object as () => TreeNode,
    selectedPath: String,
  },
  emits: ['select'],
  template: `
    <div>
      <div
        class="flex items-center gap-1 px-3 py-1.5 cursor-pointer hover:bg-gray-100 text-sm"
        :class="selectedPath === node.path ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700'"
        :style="{ paddingLeft: (node.path.split('/').length - 1) * 12 + 12 + 'px' }"
        @click="$emit('select', node.path)"
      >
        <span class="w-4 text-gray-400" @click.stop="node.expanded = !node.expanded">
          {{ node.children.length > 0 ? (node.expanded ? '▼' : '▶') : '　' }}
        </span>
        <span>📁 {{ node.name === '/' ? '/ (根目录)' : node.name }}</span>
      </div>
      <template v-if="node.expanded">
        <DirectoryTreeNode
          v-for="child in node.children"
          :key="child.path"
          :node="child"
          :selected-path="selectedPath"
          @select="$emit('select', $event)"
        />
      </template>
    </div>
  `,
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

function formatDate(isoStr: string): string {
  return new Date(isoStr).toLocaleString('zh-CN')
}

function formatMode(mode: number): string {
  const oct = mode.toString(8).padStart(4, '0')
  return oct
}

function getFileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase()
  const icons: Record<string, string> = {
    txt: '📄', md: '📝', js: '🟨', ts: '💙', vue: '💚', py: '🐍',
    json: '📋', yaml: '📋', yml: '📋', sh: '⚡', bash: '⚡',
    jpg: '🖼', jpeg: '🖼', png: '🖼', gif: '🖼', svg: '🖼',
    mp4: '🎥', mp3: '🎵', zip: '📦', tar: '📦', gz: '📦',
  }
  return icons[ext ?? ''] ?? '📄'
}

async function selectDirectory(path: string) {
  currentPath.value = path
  selectedFile.value = null
  await loadFiles(path)
  // 更新树节点
  updateTreeNode(path)
}

async function loadFiles(path: string) {
  if (!apiClient.value) return
  filesLoading.value = true
  filesError.value = null
  try {
    files.value = await listFiles(apiClient.value, path)
  } catch (err) {
    filesError.value = err instanceof Error ? err.message : '加载失败'
  } finally {
    filesLoading.value = false
  }
}

function updateTreeNode(path: string) {
  // 简单实现：展开路径并添加子目录节点
  const dirs = files.value.filter(f => f.isDir)
  addToTree(treeNodes.value, path, dirs)
}

function addToTree(nodes: TreeNode[], parentPath: string, children: FileEntry[]) {
  for (const node of nodes) {
    if (node.path === parentPath) {
      node.children = children.map(d => ({
        name: d.name,
        path: d.path,
        children: [],
        expanded: false,
      }))
      node.expanded = true
      return
    }
    addToTree(node.children, parentPath, children)
  }
}

async function handleFileClick(file: FileEntry) {
  if (file.isDir) {
    await selectDirectory(file.path)
    return
  }
  selectedFile.value = file
  fileContent.value = ''
  previewLoading.value = true
  canPreview.value = file.size <= FILE_PREVIEW_LIMIT
  if (!canPreview.value) {
    previewLoading.value = false
    return
  }
  if (!apiClient.value) return
  try {
    const res = await readFile(apiClient.value, file.path)
    fileContent.value = decodeBase64(res.content)
  } catch (err) {
    fileContent.value = '无法读取文件内容'
  } finally {
    previewLoading.value = false
  }
}

async function saveFile() {
  if (!apiClient.value || !selectedFile.value) return
  saveLoading.value = true
  try {
    await writeFile(apiClient.value, {
      path: selectedFile.value.path,
      content: encodeBase64(fileContent.value),
    })
    uiStore.success('保存成功')
  } catch (err) {
    uiStore.error(err instanceof Error ? err.message : '保存失败')
  } finally {
    saveLoading.value = false
  }
}

async function handleDelete(file: FileEntry) {
  const confirmed = await confirm({
    title: '删除确认',
    message: `确认删除 "${file.path}"？${file.isDir ? '目录删除将递归删除所有内容，不可恢复。' : '此操作不可恢复。'}`,
    confirmText: '删除',
    cancelText: '取消',
    type: 'danger',
  })
  if (!confirmed || !apiClient.value) return
  try {
    await deleteFile(apiClient.value, file.path)
    uiStore.success('删除成功')
    if (selectedFile.value?.path === file.path) selectedFile.value = null
    await loadFiles(currentPath.value)
  } catch (err) {
    uiStore.error(err instanceof Error ? err.message : '删除失败')
  }
}

// 拖拽移动
const dragSource = ref<FileEntry | null>(null)

function handleDragStart(e: DragEvent, file: FileEntry) {
  dragSource.value = file
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
  }
}

async function handleDrop(e: DragEvent, target: FileEntry) {
  if (!dragSource.value || !target.isDir || dragSource.value.path === target.path) return
  if (!apiClient.value) return
  const src = dragSource.value
  try {
    await moveFile(apiClient.value, {
      from: src.path,
      to: target.path + '/' + src.name,
    })
    uiStore.success('移动成功')
    await loadFiles(currentPath.value)
  } catch (err) {
    uiStore.error(err instanceof Error ? err.message : '移动失败')
  }
  dragSource.value = null
}

onMounted(async () => {
  await loadFiles('/')
  updateTreeNode('/')
})
</script>

