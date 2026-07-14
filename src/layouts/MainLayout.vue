<template>
  <div class="layout" :class="{ collapsed: appStore.sidebarCollapsed, dark: appStore.darkMode }">
    <aside class="sidebar">
      <div class="logo">
        <img src="@/assets/logo.svg" alt="Logo" class="logo-img" />
        <div v-show="!appStore.sidebarCollapsed" class="logo-copy">
          <strong>{{ appTitle }}</strong>
          <span>内容投放控制台</span>
        </div>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="appStore.sidebarCollapsed"
        router
        class="side-menu"
      >
        <template v-for="route in menuRoutes" :key="route.path">
          <el-menu-item :index="'/' + route.path" v-if="!route.children?.length && !route.meta?.hidden">
            <el-icon><component :is="route.meta?.icon || 'Document'" /></el-icon>
            <template #title>{{ route.meta?.title }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </aside>

    <div class="main-shell">
      <header class="header">
        <div class="header-left">
          <button class="icon-btn" type="button" @click="appStore.toggleSidebar()" aria-label="折叠菜单">
            <el-icon><Fold v-if="!appStore.sidebarCollapsed" /><Expand v-else /></el-icon>
          </button>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <button class="theme-toggle" type="button" @click="appStore.toggleTheme()" :aria-label="appStore.darkMode ? '切换白天模式' : '切换黑夜模式'">
            <el-icon><Sunny v-if="appStore.darkMode" /><Moon v-else /></el-icon>
            <span>{{ appStore.darkMode ? '白天' : '黑夜' }}</span>
          </button>
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32">{{ avatarText }}</el-avatar>
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
      </header>

      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <keep-alive :max="10">
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { Fold, Expand, Moon, Sunny } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const appStore = useAppStore()
const route = useRoute()
const router = useRouter()

const appTitle = import.meta.env.VITE_APP_TITLE || 'suhe CMS'
const activeMenu = computed(() => route.path)
const currentTitle = computed(() => (route.meta?.title as string) || '')
const avatarText = computed(() => (appStore.user?.nickname || '管').slice(0, 1))

const menuRoutes = computed(() => {
  const children = router.options.routes.find((r) => r.path === '/')?.children || []
  return children.filter((c) => !c.redirect && !String(c.path).includes(':') && !c.path.includes('/create'))
})

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
  --sidebar-width: 232px;
  --sidebar-collapsed: 72px;
  display: flex;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(1200px 500px at 10% -10%, color-mix(in srgb, var(--primary-color) 18%, transparent), transparent 60%),
    var(--bg-color);
}

.sidebar {
  width: var(--sidebar-width);
  flex-shrink: 0;
  background: linear-gradient(180deg, var(--sidebar-bg) 0%, var(--sidebar-bg-deep) 100%);
  color: #e2e8f0;
  border-right: 1px solid color-mix(in srgb, #fff 8%, transparent);
  transition: width 0.25s ease;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: auto;
}

.layout.collapsed .sidebar {
  width: var(--sidebar-collapsed);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 64px;
  padding: 0 16px;
  border-bottom: 1px solid color-mix(in srgb, #fff 8%, transparent);
}

.logo-img {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
}

.logo-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.logo-copy strong {
  font-size: 15px;
  color: #f8fafc;
  letter-spacing: 0.02em;
}

.logo-copy span {
  font-size: 11px;
  color: #94a3b8;
}

.side-menu {
  border-right: none;
  background: transparent;
  padding: 12px 8px;
}

.side-menu:not(.el-menu--collapse) {
  width: 100%;
}

.main-shell {
  flex: 1;
  min-width: 0;
  min-height: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: color-mix(in srgb, var(--surface-elevated) 88%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-btn,
.theme-toggle {
  border: 1px solid var(--border-color);
  background: var(--surface-muted);
  color: var(--text-regular);
  border-radius: 10px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.icon-btn {
  width: 36px;
  height: 36px;
}

.theme-toggle {
  height: 36px;
  padding: 0 12px;
  font-size: 13px;
}

.icon-btn:hover,
.theme-toggle:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.username {
  font-size: 14px;
  color: var(--text-primary);
}

.main-content {
  padding: 20px;
  overflow: auto;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.main-content > :deep(*) {
  min-height: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

@media (max-width: 768px) {
  .layout {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
  }
  .layout.collapsed .sidebar {
    width: 100%;
  }
}
</style>

<style>
/* Element Plus menu theming inside sidebar */
.layout .side-menu {
  --el-menu-bg-color: transparent;
  --el-menu-hover-bg-color: color-mix(in srgb, var(--primary-color) 22%, transparent);
  --el-menu-active-color: #fff;
  --el-menu-text-color: #cbd5e1;
  --el-menu-hover-text-color: #fff;
}
.layout .side-menu .el-menu-item.is-active {
  background: linear-gradient(90deg, color-mix(in srgb, var(--primary-color) 70%, transparent), color-mix(in srgb, var(--primary-color) 28%, transparent));
  border-radius: 10px;
}
.layout .side-menu .el-menu-item {
  border-radius: 10px;
  margin: 2px 0;
}
</style>
