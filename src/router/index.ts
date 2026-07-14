import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { Role } from '@/constants/enums'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { title: '登录', requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/dashboard/DashboardView.vue'), meta: { title: '仪表盘', icon: 'DataAnalysis', permission: [] as Role[] } },
      { path: 'articles', name: 'Articles', component: () => import('@/views/article/ArticleList.vue'), meta: { title: '信息管理', icon: 'Document', permission: [Role.ADMIN, Role.EDITOR] } },
      { path: 'articles/create', name: 'ArticleCreate', component: () => import('@/views/article/ArticleEditor.vue'), meta: { title: '新建文章', icon: 'EditPen', permission: [Role.ADMIN, Role.EDITOR] } },
      { path: 'articles/:id/edit', name: 'ArticleEdit', component: () => import('@/views/article/ArticleEditor.vue'), meta: { title: '编辑文章', icon: 'EditPen', permission: [Role.ADMIN, Role.EDITOR] } },
      { path: 'programs', name: 'Programs', component: () => import('@/views/program/ProgramList.vue'), meta: { title: '节目管理', icon: 'VideoCamera', permission: [Role.ADMIN, Role.EDITOR] } },
      { path: 'programs/create', name: 'ProgramCreate', component: () => import('@/views/program/ProgramEditor.vue'), meta: { title: '新建节目', icon: 'EditPen', permission: [Role.ADMIN, Role.EDITOR] } },
      { path: 'programs/:id/edit', name: 'ProgramEdit', component: () => import('@/views/program/ProgramEditor.vue'), meta: { title: '编辑节目', icon: 'EditPen', permission: [Role.ADMIN, Role.EDITOR] } },
      { path: 'devices', name: 'Devices', component: () => import('@/views/device/DeviceList.vue'), meta: { title: '设备管理', icon: 'Monitor', permission: [Role.ADMIN, Role.EDITOR] } },
      { path: 'media', name: 'Media', component: () => import('@/views/media/MediaView.vue'), meta: { title: '素材管理', icon: 'Picture', permission: [Role.ADMIN, Role.EDITOR, Role.REVIEWER] } },
      { path: 'categories', name: 'Categories', component: () => import('@/views/category/CategoryView.vue'), meta: { title: '分类标签', icon: 'Menu', permission: [Role.ADMIN, Role.EDITOR] } },
      { path: 'users', name: 'Users', component: () => import('@/views/user/UserManagement.vue'), meta: { title: '用户管理', icon: 'User', permission: [Role.ADMIN] } },
      { path: 'logs', name: 'Logs', component: () => import('@/views/user/OperationLogs.vue'), meta: { title: '操作日志', icon: 'List', permission: [Role.ADMIN, Role.REVIEWER] } },
      { path: 'settings', name: 'Settings', component: () => import('@/views/settings/SettingsView.vue'), meta: { title: '系统设置', icon: 'Setting', permission: [Role.ADMIN] } },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

const whiteList = ['/login']

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  const title = to.meta.title as string
  if (title) {
    const appName = import.meta.env.VITE_APP_TITLE || 'suhe CMS'
    document.title = title + ' - ' + appName
  }
  if (!token) {
    if (whiteList.includes(to.path)) return next()
    return next('/login')
  }
  return next()
})

export default router