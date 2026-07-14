import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Article } from '@/types'
import { http } from '@/utils/request'

export const useArticleStore = defineStore('article', () => {
  const articles = ref<Article[]>([])
  const loading = ref(false)

  async function fetchList(params: Record<string, unknown> = {}) {
    loading.value = true
    try {
      const res = await http.get<Article[]>('/api/articles', { params })
      articles.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function fetchDetail(id: number) {
    const res = await http.get<Article>('/api/articles/' + id)
    return res.data
  }

  async function create(data: Partial<Article>) {
    const res = await http.post<Article>('/api/articles', data)
    articles.value.push(res.data)
    return res.data
  }

  async function update(id: number, data: Partial<Article>) {
    const res = await http.put<Article>('/api/articles/' + id, data)
    const idx = articles.value.findIndex((a) => a.id === id)
    if (idx !== -1) articles.value[idx] = res.data
    return res.data
  }

  async function remove(id: number) {
    await http.delete('/api/articles/' + id)
    articles.value = articles.value.filter((a) => a.id !== id)
  }

  async function batchDelete(ids: number[]) {
    await http.post('/api/articles/batch-delete', { ids })
    articles.value = articles.value.filter((a) => !ids.includes(a.id))
  }

  async function batchMove(ids: number[], categoryId: number) {
    await http.post('/api/articles/batch-move', { ids, categoryId })
    articles.value.forEach((a) => {
      if (ids.includes(a.id)) a.categoryId = categoryId
    })
  }

  async function batchUpdateTags(ids: number[], tags: string[]) {
    await http.post('/api/articles/batch-tags', { ids, tags })
    articles.value.forEach((a) => {
      if (ids.includes(a.id)) a.tags = tags
    })
  }

  async function publish(id: number) {
    const res = await http.post<Article>('/api/articles/' + id + '/publish')
    const idx = articles.value.findIndex((a) => a.id === id)
    if (idx !== -1) articles.value[idx] = res.data
    return res.data
  }

  return { articles, loading, fetchList, fetchDetail, create, update, remove, batchDelete, batchMove, batchUpdateTags, publish }
})
