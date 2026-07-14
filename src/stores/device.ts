import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Device, DeviceDeployPayload, PageResult } from '@/types'
import { http } from '@/utils/request'
import { unwrapPageResult } from '@/utils/page'

export const useDeviceStore = defineStore('device', () => {
  const devices = ref<Device[]>([])
  const total = ref(0)
  const loading = ref(false)

  async function fetchList(params: Record<string, unknown> = {}) {
    loading.value = true
    try {
      const res = await http.get<Device[] | PageResult<Device>>('/devices', { params })
      const page = unwrapPageResult(res.data)
      devices.value = page.list
      total.value = page.total
      return page
    } finally {
      loading.value = false
    }
  }

  async function create(data: Partial<Device>) {
    const res = await http.post<Device>('/devices', data)
    devices.value.unshift(res.data)
    total.value += 1
    return res.data
  }

  async function update(id: number, data: Partial<Device>) {
    const res = await http.put<Device>('/devices/' + id, data)
    const idx = devices.value.findIndex((d) => d.id === id)
    if (idx !== -1) devices.value[idx] = res.data
    return res.data
  }

  async function remove(id: number) {
    await http.delete('/devices/' + id)
    devices.value = devices.value.filter((d) => d.id !== id)
    total.value = Math.max(0, total.value - 1)
  }

  async function deploy(payload: DeviceDeployPayload) {
    const res = await http.post<{ success: number; failed: number }>('/devices/deploy', payload)
    return res.data
  }

  return { devices, total, loading, fetchList, create, update, remove, deploy }
})
