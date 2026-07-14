import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { MediaItem, MediaFolder, CategoryNode, Tag, OperationLog, DashboardStats, SystemConfig } from '@/types'
import { http } from '@/utils/request'

export const useMediaStore = defineStore('media', () => {
  const items = ref<MediaItem[]>([])
  const folders = ref<MediaFolder[]>([])
  const loading = ref(false)

  async function fetchList(params: Record<string, unknown> = {}) {
    loading.value = true
    try {
      const res = await http.get<MediaItem[]>('/api/media', { params })
      items.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function fetchFolders() {
    const res = await http.get<MediaFolder[]>('/api/media/folders')
    folders.value = res.data
  }

  async function createFolder(name: string, parentId: number | null = null) {
    await http.post('/api/media/folders', { name, parentId })
    await fetchFolders()
  }

  async function updateFolder(id: number, data: Partial<MediaFolder>) {
    await http.put('/api/media/folders/' + id, data)
    await fetchFolders()
  }

  async function removeFolder(id: number) {
    await http.delete('/api/media/folders/' + id)
    await fetchFolders()
  }

  async function upload(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const res = await http.post<MediaItem>('/api/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    items.value.unshift(res.data)
    return res.data
  }

  async function remove(id: number) {
    await http.delete('/api/media/' + id)
    items.value = items.value.filter((m) => m.id !== id)
  }

  async function restore(id: number) {
    await http.post('/api/media/' + id + '/restore')
    await fetchList()
  }

  async function permanentDelete(id: number) {
    await http.delete('/api/media/' + id + '/permanent')
    items.value = items.value.filter((m) => m.id !== id)
  }

  async function updateTags(id: number, tags: string[]) {
    const res = await http.put<MediaItem>('/api/media/' + id, { tags })
    const idx = items.value.findIndex((m) => m.id === id)
    if (idx !== -1) items.value[idx] = res.data
  }

  return {
    items, folders, loading,
    fetchList, fetchFolders, createFolder, updateFolder, removeFolder,
    upload, remove, restore, permanentDelete, updateTags,
  }
})

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<CategoryNode[]>([])
  const tags = ref<Tag[]>([])

  async function fetchCategories() {
    const res = await http.get<CategoryNode[]>('/api/categories')
    categories.value = res.data
  }

  async function createCategory(name: string, parentId: number | null = null) {
    await http.post('/api/categories', { name, parentId })
    await fetchCategories()
  }

  async function updateCategory(id: number, data: Partial<CategoryNode>) {
    await http.put('/api/categories/' + id, data)
    await fetchCategories()
  }

  async function deleteCategory(id: number) {
    await http.delete('/api/categories/' + id)
    await fetchCategories()
  }

  async function fetchTags() {
    const res = await http.get<Tag[]>('/api/tags')
    tags.value = res.data
  }

  async function createTag(name: string) {
    await http.post('/api/tags', { name })
    await fetchTags()
  }

  async function deleteTag(id: number) {
    await http.delete('/api/tags/' + id)
    await fetchTags()
  }

  return { categories, tags, fetchCategories, createCategory, updateCategory, deleteCategory, fetchTags, createTag, deleteTag }
})

export const useOperationLogStore = defineStore('operationLog', () => {
  const logs = ref<OperationLog[]>([])
  const loading = ref(false)

  async function fetchList(params: Record<string, unknown> = {}) {
    loading.value = true
    try {
      const res = await http.get<OperationLog[]>('/api/logs', { params })
      logs.value = res.data
    } finally {
      loading.value = false
    }
  }

  return { logs, loading, fetchList }
})

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref<DashboardStats | null>(null)
  const config = ref<SystemConfig>({
    siteName: 'Vue CMS Admin',
    logo: '',
    defaultCategoryId: 0,
    maxUploadSize: 100,
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'avi', 'mp3', 'wav', 'pdf', 'doc', 'docx'],
  })

  async function fetchStats() {
    const res = await http.get<DashboardStats>('/api/dashboard/stats')
    stats.value = res.data
  }

  async function fetchConfig() {
    const res = await http.get<SystemConfig>('/api/settings')
    config.value = res.data
  }

  async function updateConfig(data: Partial<SystemConfig>) {
    const res = await http.put<SystemConfig>('/api/settings', data)
    config.value = res.data
  }

  return { stats, config, fetchStats, fetchConfig, updateConfig }
})
