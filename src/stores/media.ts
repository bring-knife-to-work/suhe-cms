import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { MediaItem, MediaFolder, CategoryNode, Tag, OperationLog, DashboardStats, SystemConfig, PageResult } from '@/types'
import { http } from '@/utils/request'
import { unwrapPageResult } from '@/utils/page'

export const useMediaStore = defineStore('media', () => {
  const items = ref<MediaItem[]>([])
  const folders = ref<MediaFolder[]>([])
  const total = ref(0)
  const loading = ref(false)

  async function fetchList(params: Record<string, unknown> = {}) {
    loading.value = true
    try {
      const res = await http.get<MediaItem[] | PageResult<MediaItem>>('/media', { params })
      const page = unwrapPageResult(res.data)
      items.value = page.list
      total.value = page.total
      return page
    } finally {
      loading.value = false
    }
  }

  async function fetchFolders() {
    const res = await http.get<MediaFolder[]>('/media/folders')
    folders.value = res.data
  }

  async function createFolder(name: string, parentId: number | null = null) {
    await http.post('/media/folders', { name, parentId })
    await fetchFolders()
  }

  async function updateFolder(id: number, data: Partial<MediaFolder>) {
    await http.put('/media/folders/' + id, data)
    await fetchFolders()
  }

  async function removeFolder(id: number) {
    await http.delete('/media/folders/' + id)
    await fetchFolders()
  }

  async function upload(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const res = await http.post<MediaItem>('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    items.value.unshift(res.data)
    return res.data
  }

  async function remove(id: number) {
    await http.delete('/media/' + id)
    items.value = items.value.filter((m) => m.id !== id)
  }

  async function restore(id: number) {
    await http.post('/media/' + id + '/restore')
    await fetchList()
  }

  async function permanentDelete(id: number) {
    await http.delete('/media/' + id + '/permanent')
    items.value = items.value.filter((m) => m.id !== id)
  }

  async function updateTags(id: number, tags: string[]) {
    const res = await http.put<MediaItem>('/media/' + id, { tags })
    const idx = items.value.findIndex((m) => m.id === id)
    if (idx !== -1) items.value[idx] = res.data
  }

  return {
    items, folders, total, loading,
    fetchList, fetchFolders, createFolder, updateFolder, removeFolder,
    upload, remove, restore, permanentDelete, updateTags,
  }
})

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<CategoryNode[]>([])
  const tags = ref<Tag[]>([])

  async function fetchCategories() {
    const res = await http.get<CategoryNode[]>('/categories')
    categories.value = res.data
  }

  async function createCategory(name: string, parentId: number | null = null) {
    await http.post('/categories', { name, parentId })
    await fetchCategories()
  }

  async function updateCategory(id: number, data: Partial<CategoryNode>) {
    await http.put('/categories/' + id, data)
    await fetchCategories()
  }

  async function deleteCategory(id: number) {
    await http.delete('/categories/' + id)
    await fetchCategories()
  }

  async function fetchTags() {
    const res = await http.get<Tag[]>('/tags')
    tags.value = res.data
  }

  async function createTag(name: string) {
    await http.post('/tags', { name })
    await fetchTags()
  }

  async function deleteTag(id: number) {
    await http.delete('/tags/' + id)
    await fetchTags()
  }

  return { categories, tags, fetchCategories, createCategory, updateCategory, deleteCategory, fetchTags, createTag, deleteTag }
})

export const useOperationLogStore = defineStore('operationLog', () => {
  const logs = ref<OperationLog[]>([])
  const total = ref(0)
  const loading = ref(false)

  async function fetchList(params: Record<string, unknown> = {}) {
    loading.value = true
    try {
      const res = await http.get<OperationLog[] | PageResult<OperationLog>>('/logs', { params })
      const page = unwrapPageResult(res.data)
      logs.value = page.list
      total.value = page.total
      return page
    } finally {
      loading.value = false
    }
  }

  return { logs, total, loading, fetchList }
})

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref<DashboardStats | null>(null)
  const config = ref<SystemConfig>({
    siteName: 'suhe CMS',
    logo: '',
    defaultCategoryId: 0,
    maxUploadSize: 100,
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'avi', 'mp3', 'wav', 'pdf', 'doc', 'docx'],
  })

  async function fetchStats() {
    const res = await http.get<DashboardStats>('/dashboard/stats')
    stats.value = res.data
  }

  async function fetchConfig() {
    const res = await http.get<SystemConfig>('/settings')
    config.value = res.data
  }

  async function updateConfig(data: Partial<SystemConfig>) {
    const res = await http.put<SystemConfig>('/settings', data)
    config.value = res.data
  }

  return { stats, config, fetchStats, fetchConfig, updateConfig }
})
