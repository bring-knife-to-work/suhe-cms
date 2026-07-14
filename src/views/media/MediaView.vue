<template>
  <div class="page-card">
    <div class="page-toolbar">
      <div class="toolbar-left">
        <el-input v-model="searchQuery" placeholder="搜索文件名" clearable style="width: 220px" @clear="onSearch" @keyup.enter="onSearch">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="filterType" placeholder="类型" clearable style="width: 120px" @change="onSearch">
          <el-option label="图片" value="image" /><el-option label="视频" value="video" /><el-option label="音频" value="audio" /><el-option label="文档" value="document" />
        </el-select>
        <el-select v-model="filterFolder" placeholder="文件夹" clearable style="width: 120px" @change="onSearch">
          <el-option label="图片" :value="1" /><el-option label="视频" :value="2" /><el-option label="音频" :value="3" /><el-option label="文档" :value="4" />
        </el-select>
        <el-button type="primary" @click="onSearch"><el-icon><Search /></el-icon> 搜索</el-button>
      </div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <el-button-group>
          <el-button :type="viewMode === 'grid' ? 'primary' : ''" @click="viewMode = 'grid'"><el-icon><Grid /></el-icon></el-button>
          <el-button :type="viewMode === 'list' ? 'primary' : ''" @click="viewMode = 'list'"><el-icon><List /></el-icon></el-button>
        </el-button-group>
        <el-upload action="/api/media/upload" :show-file-list="false" :before-upload="handleBeforeUpload" accept="image/*,video/*,audio/*,.pdf,.doc,.docx">
          <el-button type="primary"><el-icon><Upload /></el-icon> 上传素材</el-button>
        </el-upload>
      </div>
    </div>

    <div v-if="viewMode === 'grid'" class="media-grid" v-loading="loading">
      <div v-for="item in tableData" :key="item.id" class="media-card" :class="{ 'media-card-selected': selectedIds.includes(item.id) }" @click="handleSelect(item)">
        <div class="media-preview">
          <img v-if="item.type === 'image'" :src="item.thumbnail || item.url || placeholderImage" alt="" class="media-thumb" />
          <video v-else-if="item.type === 'video'" :src="item.url" class="media-thumb" muted />
          <div v-else class="media-type-icon" :class="typeColor(item.type)">
            <el-icon :size="32"><component :is="getTypeIcon(item.type)" /></el-icon>
          </div>
          <div class="media-overlay" @click.stop="handlePreview(item)">
            <el-icon :size="24"><ZoomIn /></el-icon>
          </div>
        </div>
        <div class="media-info">
          <div class="media-name" :title="item.name">{{ item.name }}</div>
          <div class="media-meta">
            <span class="media-type-tag" :class="typeColor(item.type)">{{ typeText(item.type) }}</span>
            <span class="media-size">{{ formatSize(item.size) }}</span>
          </div>
          <div class="media-actions">
            <el-button link type="primary" size="small" @click.stop="handlePreview(item)">预览</el-button>
            <el-button link type="danger" size="small" @click.stop="handleDelete(item)">删除</el-button>
          </div>
        </div>
      </div>
      <el-empty v-if="!tableData.length && !loading" description="暂无素材" />
    </div>

    <el-table v-else :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="name" label="文件名" min-width="200" show-overflow-tooltip />
      <el-table-column label="类型" width="100">
        <template #default="{ row }">
          <el-tag :type="typeTagColor(row.type)" size="small">{{ typeText(row.type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="大小" width="100">
        <template #default="{ row }">{{ formatSize(row.size) }}</template>
      </el-table-column>
      <el-table-column prop="folder" label="文件夹" width="100" />
      <el-table-column prop="uploader" label="上传者" width="100" />
      <el-table-column prop="createdAt" label="上传时间" width="170" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handlePreview(row)">预览</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <PaginationBar
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[12, 24, 48, 96]"
      @change="fetchData"
    />

    <el-dialog v-model="previewVisible" :title="previewItem?.name" width="700px" destroy-on-close>
      <div class="preview-container" v-if="previewItem">
        <img v-if="previewItem.type === 'image'" :src="previewItem.url || previewItem.thumbnail" style="max-width: 100%" />
        <video v-else-if="previewItem.type === 'video'" controls :src="previewItem.url" style="max-width: 100%" />
        <audio v-else-if="previewItem.type === 'audio'" controls :src="previewItem.url" style="width: 100%" />
        <div v-else class="doc-preview">
          <el-icon :size="64"><Document /></el-icon>
          <p>{{ previewItem.name }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Grid, List, Upload, ZoomIn, Document, Picture, VideoCamera, Headset, Files } from '@element-plus/icons-vue'
import { useMediaStore } from '@/stores/media'
import PaginationBar from '@/components/common/PaginationBar.vue'
import type { MediaItem } from '@/types'

const mediaStore = useMediaStore()
const searchQuery = ref('')
const filterType = ref('')
const filterFolder = ref<number | ''>('')
const tableData = ref<MediaItem[]>([])
const loading = ref(false)
const selectedIds = ref<number[]>([])
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)
const viewMode = ref<'grid' | 'list'>('grid')
const previewVisible = ref(false)
const previewItem = ref<MediaItem | null>(null)

const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjZTVlN2ViIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ub25lPC90ZXh0Pjwvc3ZnPg=='

function typeText(type: string) {
  const map: Record<string, string> = { image: '图片', video: '视频', audio: '音频', document: '文档' }
  return map[type] || type
}
function typeTagColor(type: string) {
  const map: Record<string, string> = { image: 'success', video: 'warning', audio: 'primary', document: 'info' }
  return map[type] || 'info'
}
function typeColor(type: string) {
  const map: Record<string, string> = { image: 'color-image', video: 'color-video', audio: 'color-audio', document: 'color-doc' }
  return map[type] || ''
}
function getTypeIcon(type: string) {
  const map: Record<string, unknown> = { image: Picture, video: VideoCamera, audio: Headset, document: Files }
  return map[type] || Document
}
function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function handleSelect(item: MediaItem) {
  const idx = selectedIds.value.indexOf(item.id)
  if (idx === -1) selectedIds.value.push(item.id)
  else selectedIds.value.splice(idx, 1)
}
function handleSelectionChange(rows: MediaItem[]) { selectedIds.value = rows.map(r => r.id) }
function handlePreview(item: MediaItem) { previewItem.value = item; previewVisible.value = true }

async function handleDelete(item: MediaItem) {
  await ElMessageBox.confirm(`确定删除 ${item.name} 吗？`, '警告', { type: 'warning' })
  await mediaStore.remove(item.id)
  ElMessage.success('已删除')
  fetchData()
}

function handleBeforeUpload(_file: File) {
  ElMessage.success('文件上传成功（模拟）')
  fetchData()
  return false
}

async function fetchData() {
  loading.value = true
  try {
    const params: Record<string, unknown> = { page: currentPage.value, pageSize: pageSize.value }
    if (searchQuery.value) params.keyword = searchQuery.value
    if (filterType.value) params.type = filterType.value
    if (filterFolder.value !== '') params.folderId = filterFolder.value
    await mediaStore.fetchList(params)
    tableData.value = mediaStore.items
    total.value = mediaStore.total
  } finally {
    loading.value = false
  }
}

function onSearch() {
  currentPage.value = 1
  fetchData()
}

onMounted(fetchData)
</script>

<style scoped>
.media-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; min-height: 120px; }
.media-card { border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; cursor: pointer; transition: all 0.3s; background: var(--surface-elevated); }
.media-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-2px); }
.media-card-selected { border-color: var(--primary-color); box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-color) 30%, transparent); }
.media-preview { position: relative; width: 100%; height: 140px; background: #f5f5f5; overflow: hidden; }
.media-thumb { width: 100%; height: 100%; object-fit: cover; }
.media-type-icon { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #fff; }
.color-image { background: #67c23a; }
.color-video { background: #e6a23c; }
.color-audio { background: #409eff; }
.color-doc { background: #909399; }
.media-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: #fff; opacity: 0; transition: opacity 0.2s; }
.media-card:hover .media-overlay { opacity: 1; }
.media-info { padding: 10px; }
.media-name { font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 6px; }
.media-meta { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; }
.media-actions { display: flex; gap: 4px; }
.doc-preview { text-align: center; padding: 40px; color: var(--text-secondary); }
</style>
