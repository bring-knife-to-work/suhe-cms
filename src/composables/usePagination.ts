import { ref, computed, type Ref } from 'vue'

/** 通用分页状态，配合本地切片或服务端翻页 */
export function usePagination(defaultPageSize = 10) {
  const currentPage = ref(1)
  const pageSize = ref(defaultPageSize)
  const total = ref(0)

  function resetPage() {
    currentPage.value = 1
  }

  function sliceLocal<T>(all: T[]) {
    total.value = all.length
    const start = (currentPage.value - 1) * pageSize.value
    return all.slice(start, start + pageSize.value)
  }

  function applyServerPage(payload: { list: unknown[]; total: number; page?: number; pageSize?: number }) {
    total.value = payload.total
    if (payload.page) currentPage.value = payload.page
    if (payload.pageSize) pageSize.value = payload.pageSize
  }

  const query = computed(() => ({
    page: currentPage.value,
    pageSize: pageSize.value,
  }))

  return {
    currentPage,
    pageSize,
    total,
    query,
    resetPage,
    sliceLocal,
    applyServerPage,
  }
}

/** 本地数组分页（过滤后再切片） */
export function paginateArray<T>(all: T[], page: number, pageSize: number) {
  const total = all.length
  const safePage = Math.max(1, page)
  const safeSize = Math.max(1, pageSize)
  const maxPage = Math.max(1, Math.ceil(total / safeSize) || 1)
  const current = Math.min(safePage, maxPage)
  const start = (current - 1) * safeSize
  return {
    list: all.slice(start, start + safeSize),
    total,
    page: current,
    pageSize: safeSize,
  }
}

export type PaginationRefs = {
  currentPage: Ref<number>
  pageSize: Ref<number>
  total: Ref<number>
}
