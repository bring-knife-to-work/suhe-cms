import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User, LoginParams } from '@/types'
import { http } from '@/utils/request'
import { useAppStore } from './app'

export const useAuthStore = defineStore('auth', () => {
  const loading = ref(false)

  async function login(params: LoginParams) {
    loading.value = true
    try {
      const res = await http.post<{ token: string; user: User }>('/auth/login', params)
      localStorage.setItem('token', res.data.token)
      const appStore = useAppStore()
      appStore.setToken(res.data.token)
      appStore.setUser(res.data.user)
      return res.data
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await http.post('/auth/logout')
    } finally {
      const appStore = useAppStore()
      appStore.logout()
    }
  }

  return { loading, login, logout }
})
