<template>
  <div class="layout" :class="{ 'layout-collapsed': appStore.sidebarCollapsed }">
    <el-container>
      <el-aside :width="appStore.sidebarCollapsed ? '64px' : '220px'" class="sidebar">
        <div class="logo">
          <img src="@/assets/logo.svg" alt="Logo" class="logo-img" />
          <span v-show="!appStore.sidebarCollapsed" class="logo-text">{{ appTitle }}</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          :collapse="appStore.sidebarCollapsed"
          router
          background-color="#001529"
          text-color="#ffffffa6"
          active-text-color="#1890ff"
        >
          <template v-for="route in menuRoutes" :key="route.path">
            <el-menu-item :index="route.path" v-if="!route.children?.length">
              <el-icon><component :is="route.meta?.icon || 'Document'" /></el-icon>
              <template #title>{{ route.meta?.title }}</template>
            </el-menu-item>
            <el-sub-menu :index="route.path" v-else>
              <template #title>
                <el-icon><component :is="route.meta?.icon || 'Folder'" /></el-icon>
                <span>{{ route.meta?.title }}</span>
              </template>
              <el-menu-item
                v-for="child in route.children"
                :key="child.path"
                :index="child.path"
                v-if="!child.meta?.hidden"
              >
                <el-icon><component :is="child.meta?.icon || 'Document'" /></el-icon>
                <template #title>{{ child.meta?.title }}</template>
              </el-menu-item>
            </el-sub-menu>
          </template>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="header">
          <div class="header-left">
            <el-icon class="collapse-btn" @click="toggleSidebar">
              <Fold v-if="!appStore.sidebarCollapsed" />
              <Expand v-else />
            </el-icon>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <el-tooltip content="切换主题" placement="bottom">
              <el-icon class="header-action" @click="appStore.toggleTheme()">
                <Monitor v-if="!appStore.darkMode" />
                <Sunny v-else />
              </el-icon>
            </el-tooltip>
            <el-dropdown @command="handleCommand">
              <span class="user-info">
                <el-avatar :size="32" :src="appStore.user?.avatar || ''" />
                <span class="username">{{ appStore.user?.nickname || '管理员' }}</span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        <el-main class="main-content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <keep-alive :max="10">
                <component :is="Component" />
              </keep-alive>
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { Fold, Expand, Monitor, Sunny } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const appStore = useAppStore()
const route = useRoute()
const router = useRouter()

const appTitle = import.meta.env.VITE_APP_TITLE || 'CMS Admin'

const activeMenu = computed(() => route.path)
const currentTitle = computed(() => (route.meta?.title as string) || '')

const menuRoutes = computed(() => {
  return router.options.routes.find((r) => r.path === '/')?.children?.filter((c) => !c.redirect) || []
})

function toggleSidebar() {
  appStore.toggleSidebar()
}

async function handleCommand(command: string) {
  if (command === 'logout') {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', { type: 'warning' })
    appStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.layout {
  height: 100vh;
  width: 100%;
}
.layout-collapsed .sidebar {
  overflow: hidden;
}
.sidebar {
  background-color: #001529;
  transition: width 0.3s;
  overflow-x: hidden;
}
.logo {
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 16px;
  background-color: #002140;
}
.logo-img {
  width: 32px;
  height: 32px;
  margin-right: 8px;
}
.logo-text {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
}
.el-menu {
  border-right: none;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #666;
}
.collapse-btn:hover {
  color: #1890ff;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.header-action {
  font-size: 18px;
  cursor: pointer;
  color: #666;
  padding: 4px;
}
.header-action:hover {
  color: #1890ff;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.username {
  font-size: 14px;
  color: #333;
}
.main-content {
  background: #f5f5f5;
  padding: 16px;
  overflow-y: auto;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
