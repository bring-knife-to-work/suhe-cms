import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Article, PageResult } from '@/types'
import { http } from '@/utils/request'
import { unwrapPageResult } from '@/utils/page'

export const useArticleStore = defineStore('article', () => {
  const articles = ref<Article[]>([])
  const total = ref(0)
  const loading = ref(false)

  async function fetchList(params: Record<string, unknown> = {}) {
    loading.value = true
    try {
      const res = await http.get<Article[] | PageResult<Article>>('/articles', { params })
      const page = unwrapPageResult(res.data)
      articles.value = page.list
      total.value = page.total
      return page
    } finally {
      loading.value = false
    }
  }

  async function fetchDetail(id: number) {
    const res = await http.get<Article>('/articles/' + id)
    return res.data
  }

  async function create(data: Partial<Article>) {
    const res = await http.post<Article>('/articles', data)
    articles.value.push(res.data)
    return res.data
  }

  async function update(id: number, data: Partial<Article>) {
    const res = await http.put<Article>('/articles/' + id, data)
    const idx = articles.value.findIndex((a) => a.id === id)
    if (idx !== -1) articles.value[idx] = res.data
    return res.data
  }

  async function remove(id: number) {
    await http.delete('/articles/' + id)
    articles.value = articles.value.filter((a) => a.id !== id)
  }

  async function batchDelete(ids: number[]) {
    await http.post('/articles/batch-delete', { ids })
    articles.value = articles.value.filter((a) => !ids.includes(a.id))
  }

  async function batchMove(ids: number[], categoryId: number) {
    await http.post('/articles/batch-move', { ids, categoryId })
    articles.value.forEach((a) => {
      if (ids.includes(a.id)) a.categoryId = categoryId
    })
  }

  async function batchUpdateTags(ids: number[], tags: string[]) {
    await http.post('/articles/batch-tags', { ids, tags })
    articles.value.forEach((a) => {
      if (ids.includes(a.id)) a.tags = tags
    })
  }

  async function publish(id: number) {
    const res = await http.post<Article>('/articles/' + id + '/publish')
    const idx = articles.value.findIndex((a) => a.id === id)
    if (idx !== -1) articles.value[idx] = res.data
    return res.data
  }

  return { articles, total, loading, fetchList, fetchDetail, create, update, remove, batchDelete, batchMove, batchUpdateTags, publish }
})
