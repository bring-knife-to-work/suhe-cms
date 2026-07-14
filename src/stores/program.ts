import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Program, ProgramChapter, ProgramAsset, PageResult } from '@/types'
import { http } from '@/utils/request'
import { unwrapPageResult } from '@/utils/page'

export const useProgramStore = defineStore('program', () => {
  const programs = ref<Program[]>([])
  const total = ref(0)
  const loading = ref(false)

  async function fetchList(params: Record<string, unknown> = {}) {
    loading.value = true
    try {
      const res = await http.get<Program[] | PageResult<Program>>('/programs', { params })
      const page = unwrapPageResult(res.data)
      programs.value = page.list
      total.value = page.total
      return page
    } finally {
      loading.value = false
    }
  }

  async function fetchDetail(id: number) {
    const res = await http.get<Program>('/programs/' + id)
    return res.data
  }

  async function create(data: Partial<Program>) {
    const res = await http.post<Program>('/programs', data)
    programs.value.push(res.data)
    return res.data
  }

  async function update(id: number, data: Partial<Program>) {
    const res = await http.put<Program>('/programs/' + id, data)
    const idx = programs.value.findIndex((p) => p.id === id)
    if (idx !== -1) programs.value[idx] = res.data
    return res.data
  }

  async function remove(id: number) {
    await http.delete('/programs/' + id)
    programs.value = programs.value.filter((p) => p.id !== id)
  }

  async function addChapter(programId: number, chapter: Omit<ProgramChapter, 'id'>) {
    const res = await http.post<ProgramChapter>('/programs/' + programId + '/chapters', chapter)
    const prog = programs.value.find((p) => p.id === programId)
    if (prog) prog.chapters.push({ ...res.data, id: res.data.id })
    return res.data
  }

  async function updateChapter(programId: number, chapterId: number, data: Partial<ProgramChapter>) {
    const res = await http.put<ProgramChapter>('/programs/' + programId + '/chapters/' + chapterId, data)
    const prog = programs.value.find((p) => p.id === programId)
    if (prog) {
      const ch = prog.chapters.find((c) => c.id === chapterId)
      if (ch) Object.assign(ch, res.data)
    }
    return res.data
  }

  async function removeChapter(programId: number, chapterId: number) {
    await http.delete('/programs/' + programId + '/chapters/' + chapterId)
    const prog = programs.value.find((p) => p.id === programId)
    if (prog) prog.chapters = prog.chapters.filter((c) => c.id !== chapterId)
  }

  async function reorderChapters(programId: number, chapterIds: number[]) {
    await http.post('/programs/' + programId + '/chapters/reorder', { chapterIds })
    const prog = programs.value.find((p) => p.id === programId)
    if (prog) {
      prog.chapters.sort((a, b) => chapterIds.indexOf(a.id) - chapterIds.indexOf(b.id))
    }
  }

  async function associateAsset(programId: number, mediaId: number, type: ProgramAsset['type']) {
    const res = await http.post<ProgramAsset>('/programs/' + programId + '/assets', { mediaId, type })
    const prog = programs.value.find((p) => p.id === programId)
    if (prog) prog.assets.push(res.data)
    return res.data
  }

  async function setCover(programId: number, assetId: number) {
    await http.put('/programs/' + programId + '/cover', { assetId })
  }

  async function rollback(programId: number, version: number) {
    const res = await http.post<Program>('/programs/' + programId + '/rollback', { version })
    const idx = programs.value.findIndex((p) => p.id === programId)
    if (idx !== -1) programs.value[idx] = res.data
    return res.data
  }

  return {
    programs, total, loading, fetchList, fetchDetail, create, update, remove,
    addChapter, updateChapter, removeChapter, reorderChapters,
    associateAsset, setCover, rollback,
  }
})
