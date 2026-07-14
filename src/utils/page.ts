import type { PageResult } from '@/types'

/** 兼容历史数组返回与分页结构 { list, total } */
export function unwrapPageResult<T>(data: T[] | PageResult<T>): PageResult<T> {
  if (Array.isArray(data)) {
    return { list: data, total: data.length, page: 1, pageSize: data.length || 10 }
  }
  return {
    list: data.list || [],
    total: data.total ?? 0,
    page: data.page ?? 1,
    pageSize: data.pageSize ?? 10,
  }
}
