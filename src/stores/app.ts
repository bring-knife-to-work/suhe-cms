import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginParams, DashboardStats, SystemConfig } from '@/types'
import { Role } from '@/constants/enums'

export const useAppStore = defineStore('app', () => {
  const user = ref<User | null>(null)
  const token = ref<string>(localStorage.getItem('token') || '')
  const darkMode = ref<boolean>(localStorage.getItem('theme') === 'dark')
  const sidebarCollapsed = ref(false)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === Role.ADMIN)
  const isEditor = computed(() => [Role.ADMIN, Role.EDITOR].includes(user.value?.role ?? Role.GUEST))

  function setToken(t: string) {
    token.value = t
    localStorage.setItem('token', t)
  }

  function setUser(u: User) {
    user.value = u
    localStorage.setItem('user', JSON.stringify(u))
  }

function toggleTheme() {
  darkMode.value = !darkMode.value
  localStorage.setItem('theme', darkMode.value ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark', darkMode.value)
}

function initTheme() {
  document.documentElement.classList.toggle('dark', darkMode.value)
}

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // Restore persisted state
  const savedUser = localStorage.getItem('user')
  if (savedUser) {
    try { user.value = JSON.parse(savedUser) } catch { /* ignore */ }
  }
  initTheme()

  return { user, token, darkMode, sidebarCollapsed, isLoggedIn, isAdmin, isEditor, setToken, setUser, toggleTheme, toggleSidebar, logout }
})