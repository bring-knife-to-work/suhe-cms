import { defineConfig } from 'vite-plugin-mock-dev-server'
import { mockUsers, mockArticles, mockPrograms, mockMedia, mockCategories, mockTags, mockLogs, mockDashboard } from './data'

export default defineConfig([
  // Auth
  {
    url: '/api/auth/login',
    method: 'post',
    body: () => {
      const body = JSON.parse(JSON.stringify(this.body || {}))
      const user = mockUsers.find((u) => u.username === body.username)
      if (user) {
        return { code: 0, data: { token: 'mock-jwt-token-' + Date.now(), user }, message: 'ok' }
      }
      return { code: 401, data: null, message: '用户名或密码错误' }
    },
  },
  { url: '/api/auth/logout', method: 'post', body: () => ({ code: 0, data: null, message: 'ok' }) },

  // Dashboard
  { url: '/api/dashboard/stats', method: 'get', body: () => ({ code: 0, data: mockDashboard, message: 'ok' }) },

  // Articles
  { url: '/api/articles', method: 'get', body: () => ({ code: 0, data: mockArticles, message: 'ok' }) },
  { url: '/api/articles/:id', method: 'get', body: () => ({ code: 0, data: mockArticles[0], message: 'ok' }) },
  { url: '/api/articles', method: 'post', body: () => ({ code: 0, data: { id: Date.now(), ...this.body }, message: 'ok' }) },
  { url: '/api/articles/:id', method: 'put', body: () => ({ code: 0, data: { id: this.params.id, ...this.body }, message: 'ok' }) },
  { url: '/api/articles/:id', method: 'delete', body: () => ({ code: 0, data: null, message: 'ok' }) },
  { url: '/api/articles/batch-delete', method: 'post', body: () => ({ code: 0, data: null, message: 'ok' }) },
  { url: '/api/articles/batch-move', method: 'post', body: () => ({ code: 0, data: null, message: 'ok' }) },
  { url: '/api/articles/batch-tags', method: 'post', body: () => ({ code: 0, data: null, message: 'ok' }) },
  { url: '/api/articles/:id/publish', method: 'post', body: () => ({ code: 0, data: { status: 'published' }, message: 'ok' }) },

  // Programs
  { url: '/api/programs', method: 'get', body: () => ({ code: 0, data: mockPrograms, message: 'ok' }) },
  { url: '/api/programs/:id', method: 'get', body: () => ({ code: 0, data: mockPrograms[0], message: 'ok' }) },
  { url: '/api/programs', method: 'post', body: () => ({ code: 0, data: { id: Date.now(), ...this.body }, message: 'ok' }) },
  { url: '/api/programs/:id', method: 'put', body: () => ({ code: 0, data: { id: this.params.id, ...this.body }, message: 'ok' }) },
  { url: '/api/programs/:id', method: 'delete', body: () => ({ code: 0, data: null, message: 'ok' }) },
  { url: '/api/programs/:id/chapters', method: 'post', body: () => ({ code: 0, data: { id: Date.now(), ...this.body }, message: 'ok' }) },
  { url: '/api/programs/:pid/chapters/:cid', method: 'put', body: () => ({ code: 0, data: { ...this.body }, message: 'ok' }) },
  { url: '/api/programs/:pid/chapters/:cid', method: 'delete', body: () => ({ code: 0, data: null, message: 'ok' }) },
  { url: '/api/programs/:id/assets', method: 'post', body: () => ({ code: 0, data: { id: Date.now(), ...this.body }, message: 'ok' }) },
  { url: '/api/programs/:id/rollback', method: 'post', body: () => ({ code: 0, data: { version: this.body.version }, message: 'ok' }) },

  // Media
  { url: '/api/media', method: 'get', body: () => ({ code: 0, data: mockMedia, message: 'ok' }) },
  { url: '/api/media/folders', method: 'get', body: () => ({ code: 0, data: [], message: 'ok' }) },
  { url: '/api/media/upload', method: 'post', body: () => ({ code: 0, data: { id: Date.now(), name: 'uploaded_file' }, message: 'ok' }) },
  { url: '/api/media/:id', method: 'delete', body: () => ({ code: 0, data: null, message: 'ok' }) },

  // Categories & Tags
  { url: '/api/categories', method: 'get', body: () => ({ code: 0, data: mockCategories, message: 'ok' }) },
  { url: '/api/categories', method: 'post', body: () => ({ code: 0, data: { id: Date.now(), ...this.body }, message: 'ok' }) },
  { url: '/api/categories/:id', method: 'put', body: () => ({ code: 0, data: { ...this.body }, message: 'ok' }) },
  { url: '/api/categories/:id', method: 'delete', body: () => ({ code: 0, data: null, message: 'ok' }) },
  { url: '/api/tags', method: 'get', body: () => ({ code: 0, data: mockTags, message: 'ok' }) },
  { url: '/api/tags', method: 'post', body: () => ({ code: 0, data: { id: Date.now(), ...this.body }, message: 'ok' }) },
  { url: '/api/tags/:id', method: 'delete', body: () => ({ code: 0, data: null, message: 'ok' }) },

  // Logs
  { url: '/api/logs', method: 'get', body: () => ({ code: 0, data: mockLogs, message: 'ok' }) },

  // Settings
  { url: '/api/settings', method: 'get', body: () => ({ code: 0, data: {}, message: 'ok' }) },
  { url: '/api/settings', method: 'put', body: () => ({ code: 0, data: this.body, message: 'ok' }) },
])
