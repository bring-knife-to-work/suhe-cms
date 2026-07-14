<template>
  <div class="page-card">
    <div class="page-toolbar">
      <div class="toolbar-left">
        <el-input v-model="searchQuery" placeholder="搜索文件名" clearable style="width: 220px">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="filterType" placeholder="类型" clearable style="width: 120px">
          <el-option label="图片" value="image" /><el-option label="视频" value="video" /><el-option label="音频" value="audio" /><el-option label="文档" value="document" />
        </el-select>
        <el-select v-model="filterFolder" placeholder="文件夹" clearable style="width: 120px">
          <el-option label="图片" :value="1" /><el-option label="视频" :value="2" /><el-option label="音频" :value="3" /><el-option label="文档" :value="4" />
        </el-select>
        <el-button type="primary" @click="fetchData"><el-icon><Search /></el-icon> 搜索</el-button>
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

    <!-- Grid View -->
    <div v-if="viewMode === 'grid'" class="media-grid">
      <div v-for="item in tableData" :key="item.id" class="media-card" :class="{ 'media-card-selected': selectedIds.includes(item.id) }" @click="handleSelect(item)">
        <div class="media-preview">
          <img v-if="item.type === 'image'" :src="item.thumbnail || placeholderImage" alt="" class="media-thumb" />
          <video v-else-if="item.type === 'video'" :src="item.url" class="media-thumb" muted />
          <div v-else class="media-type-icon" :class="typeColor(item.type)">
            <el-icon :size="32"><getTypeIcon(item.type) /></el-icon>
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
            <el-button link type="primary" size="small" @click="handleEditTags(item)">标签</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(item)">删除</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- List View -->
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

    <div class="pagination-wrapper">
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[12, 24, 48]" :total="total" layout="total, sizes, prev, pager, next" />
    </div>

    <!-- Preview Dialog -->
    <el-dialog v-model="previewVisible" :title="previewItem?.name" width="700px" destroy-on-close>
      <div class="preview-container" v-if="previewItem">
        <img v-if="previewItem.type === 'image'" :src="previewItem.url" style="max-width: 100%" />
        <video v-else-if="previewItem.type === 'video'" controls :src="previewItem.url" style="max-width: 100%" />
        <audio v-else-if="previewItem.type === 'audio'" controls :src="previewItem.url" style="width: 100%" />
        <div v-else class="doc-preview">
          <el-icon :size="64"><Document /></el-icon>
          <p>{{ previewItem.name }}</p>
        </div>
      </div>
      <template #footer>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="类型">{{ typeText(previewItem?.type || '') }}</el-descriptions-item>
          <el-descriptions-item label="大小">{{ formatSize(previewItem?.size || 0) }}</el-descriptions-item>
          <el-descriptions-item label="标签">
            <el-tag v-for="t in (previewItem?.tags || [])" :key="t" size="small" style="margin-right: 4px">{{ t }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="上传者">{{ previewItem?.uploader }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Grid, List, Upload, ZoomIn, Document, Picture, VideoCamera, Headset, Files } from '@element-plus/icons-vue'
import type { MediaItem } from '@/types'

const searchQuery = ref('')
const filterType = ref('')
const filterFolder = ref('')
const tableData = ref<MediaItem[]>([])
const loading = ref(false)
const selectedIds = ref<number[]>([])
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(80)
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
  const map: Record<string, string> = { image: 'Picture', video: 'VideoCamera', audio: 'Headset', document: 'Files' }
  return map[type] || 'Document'
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
function handleEditTags(_item: MediaItem) { ElMessage.info('编辑标签功能') }

async function handleDelete(item: MediaItem) {
  await ElMessageBox.confirm(`确定删除 ${item.name} 吗？`, '警告', { type: 'warning' })
  ElMessage.success('已移至回收站')
}

function handleBeforeUpload(_file: File) {
  ElMessage.success('文件上传成功（模拟）')
  return false
}

async function fetchData() {
  loading.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    tableData.value = Array.from({ length: pageSize.value }, (_, i) => ({
      id: (currentPage.value - 1) * pageSize.value + i + 1,
      name: `素材_${(currentPage.value - 1) * pageSize.value + i + 1}.jpg`,
      type: ['image', 'video', 'audio', 'document'][i % 4] as any,
      size: Math.floor(Math.random() * 50000000) + 100000,
      folder: ['图片', '视频', '音频', '文档'][i % 4],
      uploader: '管理员',
      tags: ['默认'],
      createdAt: '2024-07-01',
      url: '', thumbnail: '', uploader: '管理员',
    }))
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 16px; }
.media-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
.media-card { border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; cursor: pointer; transition: all 0.3s; }
.media-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-2px); }
.media-card-selected { border-color: #409eff; box-shadow: 0 0 0 2px rgba(64,158,255,0.3); }
.media-preview { position: relative; width: 100%; height: 140px; background: #f5f5f5; overflow: hidden; }
.media-thumb { width: 100%; height: 100%; object-fit: cover; }
.media-type-icon { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #fff; }
.color-image { background: #67c23a; }
.color-video { background: #e6a23c; }
.color-audio { background: #409eff; }
.color-doc { background: #909399; }
.media-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: #fff; opacity: 0; transition: opacity 0.3s; cursor: pointer; }
.media-card:hover .media-overlay { opacity: 1; }
.media-info { padding: 12px; }
.media-name { font-size: 13px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 6px; }
.media-meta { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--text-secondary); }
.media-actions { display: flex; gap: 4px; margin-top: 8px; }
.preview-container { min-height: 200px; display: flex; align-items: center; justify-content: center; background: #000; border-radius: 4px; margin-bottom: 16px; }
.doc-preview { text-align: center; color: #999; }
.doc-preview p { margin-top: 12px; }
</style>

