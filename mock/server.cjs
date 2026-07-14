const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

const app = express()
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

const mockUsers = [
  { id: 1, username: 'admin', nickname: '管理员', email: 'admin@cms.com', role: 'admin', avatar: '', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 2, username: 'editor1', nickname: '张三', email: 'editor@cms.com', role: 'editor', avatar: '', createdAt: '2024-02-15', updatedAt: '2024-03-01' },
  { id: 3, username: 'reviewer1', nickname: '李四', email: 'reviewer@cms.com', role: 'reviewer', avatar: '', createdAt: '2024-03-01', updatedAt: '2024-03-15' },
  { id: 4, username: 'guest1', nickname: '王五', email: 'guest@cms.com', role: 'guest', avatar: '', createdAt: '2024-04-01', updatedAt: '2024-04-01' },
]

const mockDashboard = {
  totalArticles: 1258, totalPrograms: 367, totalMedia: 5432,
  todayUpdates: 23, pendingReview: 12, publishedCount: 980, draftCount: 200, rejectedCount: 78,
  mediaBreakdown: [{ type: '图片', count: 2500 }, { type: '视频', count: 1200 }, { type: '音频', count: 900 }, { type: '文档', count: 832 }],
  recentActivities: [
    { id: 1, user: '管理员', action: '创建了文章', target: '标题1', time: '5分钟前' },
    { id: 2, user: '张三', action: '发布了节目', target: '节目2', time: '15分钟前' },
    { id: 3, user: '李四', action: '上传了素材', target: '素材.jpg', time: '30分钟前' },
  ],
}

const mockArticles = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1, title: '这篇文章的标题是第 ' + (i + 1) + ' 篇', summary: '这是第 ' + (i + 1) + ' 篇文章的摘要',
  content: '<p>正文内容</p>', authorId: (i % 4) + 1, authorName: mockUsers[i % 4]?.nickname || '未知',
  coverImage: '', categoryId: (i % 5) + 1, category: ['科技', '文化', '生活', '娱乐', '体育'][i % 5],
  tags: ['推荐', '热门', '精选'].slice(0, (i % 3) + 1),
  status: ['draft', 'pending', 'published', 'rejected'][i % 4],
  publishTime: i % 3 === 0 ? '2024-07-01' : null, viewCount: Math.floor(Math.random() * 5000),
  createdAt: '2024-01-01', updatedAt: '2024-01-01',
}))

const mockPrograms = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1, title: '节目名称 ' + (i + 1), description: '节目描述',
  coverImage: '', categoryId: (i % 5) + 1, category: ['纪录片', '综艺', '新闻', '电视剧', '动画'][i % 5],
  tags: ['热门', '原创', '独家'].slice(0, (i % 3) + 1),
  creators: ['导演A', '编剧B'], copyright: 'copyright',
  status: ['draft', 'pending', 'published', 'archived'][i % 4],
  publishTime: i % 2 === 0 ? '2024-07-01' : null,
  chapters: [{ id: i * 100 + 1, title: '第1集', sortOrder: 0, duration: 1800 }],
  assets: [{ id: i * 10 + 1, mediaId: i + 1, type: 'cover', isCover: true }],
  version: 1, history: [{ id: 1, version: 1, title: 'v1', description: '初始版本', createdAt: '2024-01-01', createdBy: '管理员' }],
  createdAt: '2024-01-01', updatedAt: '2024-01-01',
}))

const mockMedia = Array.from({ length: 80 }, (_, i) => ({
  id: i + 1, name: '素材_' + (i + 1) + '.jpg', url: '', thumbnail: '',
  type: ['image', 'video', 'audio', 'document'][i % 4],
  size: Math.floor(Math.random() * 50000000) + 100000,
  tags: ['默认'], folderId: (i % 5) + 1, folder: ['图片', '视频', '音频', '文档', '其他'][i % 5],
  uploader: '管理员', usedBy: [], createdAt: '2024-01-01', updatedAt: '2024-01-01',
}))

const mockCategories = [
  { id: 1, name: '科技', parentId: null, sort: 1, children: [{ id: 11, name: '人工智能', parentId: 1, sort: 1, children: [] }] },
  { id: 2, name: '文化', parentId: null, sort: 2, children: [] },
  { id: 3, name: '生活', parentId: null, sort: 3, children: [] },
]

const mockTags = [{ id: 1, name: '推荐', usageCount: 15 }, { id: 2, name: '热门', usageCount: 23 }, { id: 3, name: '精选', usageCount: 8 }]

const mockLogs = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1, userId: (i % 4) + 1, userName: mockUsers[i % 4]?.nickname || '未知',
  action: ['创建', '更新', '删除', '发布'][i % 4], targetType: ['文章', '节目', '素材'][i % 3],
  targetId: Math.floor(Math.random() * 100) + 1,
  description: mockUsers[i % 4]?.nickname + ' ' + ['创建', '更新', '删除', '发布'][i % 4] + '了' + ['文章', '节目', '素材'][i % 3],
  ip: '192.168.1.' + (i % 255), createdAt: '2024-07-01',
}))

// Auth
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body
  const user = mockUsers.find(u => u.username === username)
  if (user) {
    res.json({ code: 0, data: { token: 'mock-jwt-token-' + Date.now(), user }, message: 'ok' })
  } else {
    res.status(401).json({ code: 401, data: null, message: '用户名或密码错误' })
  }
})
app.post('/api/auth/logout', (req, res) => res.json({ code: 0, data: null, message: 'ok' }))

// Dashboard
app.get('/api/dashboard/stats', (req, res) => res.json({ code: 0, data: mockDashboard, message: 'ok' }))

// Articles
app.get('/api/articles', (req, res) => {
  let filtered = [...mockArticles]
  if (req.query.keyword) filtered = filtered.filter(a => a.title.includes(req.query.keyword))
  if (req.query.status) filtered = filtered.filter(a => a.status === req.query.status)
  if (req.query.category) filtered = filtered.filter(a => a.category === req.query.category)
  res.json({ code: 0, data: filtered, message: 'ok' })
})
app.get('/api/articles/:id', (req, res) => {
  const a = mockArticles.find(x => x.id === parseInt(req.params.id))
  res.json({ code: 0, data: a || mockArticles[0], message: 'ok' })
})
app.post('/api/articles', (req, res) => { const n = { id: Date.now(), ...req.body, createdAt: new Date().toISOString().slice(0, 10) }; mockArticles.push(n); res.json({ code: 0, data: n, message: 'ok' }) })
app.put('/api/articles/:id', (req, res) => { const i = mockArticles.findIndex(x => x.id === parseInt(req.params.id)); if (i >= 0) { mockArticles[i] = { ...mockArticles[i], ...req.body }; res.json({ code: 0, data: mockArticles[i], message: 'ok' }) } else { res.json({ code: 0, data: req.body, message: 'ok' }) } })
app.delete('/api/articles/:id', (req, res) => { const i = mockArticles.findIndex(x => x.id === parseInt(req.params.id)); if (i >= 0) mockArticles.splice(i, 1); res.json({ code: 0, data: null, message: 'ok' }) })
app.post('/api/articles/batch-delete', (req, res) => { req.body.ids.forEach(id => { const i = mockArticles.findIndex(x => x.id === id); if (i >= 0) mockArticles.splice(i, 1) }); res.json({ code: 0, data: null, message: 'ok' }) })
app.post('/api/articles/batch-move', (req, res) => res.json({ code: 0, data: null, message: 'ok' }))
app.post('/api/articles/batch-tags', (req, res) => res.json({ code: 0, data: null, message: 'ok' }))
app.post('/api/articles/:id/publish', (req, res) => { const i = mockArticles.findIndex(x => x.id === parseInt(req.params.id)); if (i >= 0) mockArticles[i].status = 'published'; res.json({ code: 0, data: mockArticles[i] || { status: 'published' }, message: 'ok' }) })

// Programs
app.get('/api/programs', (req, res) => res.json({ code: 0, data: mockPrograms, message: 'ok' }))
app.get('/api/programs/:id', (req, res) => { const p = mockPrograms.find(x => x.id === parseInt(req.params.id)); res.json({ code: 0, data: p || mockPrograms[0], message: 'ok' }) })
app.post('/api/programs', (req, res) => { const n = { id: Date.now(), ...req.body, createdAt: new Date().toISOString().slice(0, 10) }; mockPrograms.push(n); res.json({ code: 0, data: n, message: 'ok' }) })
app.put('/api/programs/:id', (req, res) => { const i = mockPrograms.findIndex(x => x.id === parseInt(req.params.id)); if (i >= 0) { mockPrograms[i] = { ...mockPrograms[i], ...req.body }; res.json({ code: 0, data: mockPrograms[i], message: 'ok' }) } else { res.json({ code: 0, data: req.body, message: 'ok' }) } })
app.delete('/api/programs/:id', (req, res) => { const i = mockPrograms.findIndex(x => x.id === parseInt(req.params.id)); if (i >= 0) mockPrograms.splice(i, 1); res.json({ code: 0, data: null, message: 'ok' }) })
app.post('/api/programs/:id/chapters', (req, res) => res.json({ code: 0, data: { id: Date.now(), ...req.body }, message: 'ok' }))
app.put('/api/programs/:pid/chapters/:cid', (req, res) => res.json({ code: 0, data: { ...req.body }, message: 'ok' }))
app.delete('/api/programs/:pid/chapters/:cid', (req, res) => res.json({ code: 0, data: null, message: 'ok' }))
app.post('/api/programs/:id/chapters/reorder', (req, res) => res.json({ code: 0, data: null, message: 'ok' }))
app.post('/api/programs/:id/assets', (req, res) => res.json({ code: 0, data: { id: Date.now(), ...req.body }, message: 'ok' }))
app.put('/api/programs/:id/cover', (req, res) => res.json({ code: 0, data: null, message: 'ok' }))
app.post('/api/programs/:id/rollback', (req, res) => res.json({ code: 0, data: { version: req.body.version }, message: 'ok' }))

// Media
app.get('/api/media', (req, res) => res.json({ code: 0, data: mockMedia, message: 'ok' }))
app.get('/api/media/folders', (req, res) => res.json({ code: 0, data: [], message: 'ok' }))
app.post('/api/media/upload', (req, res) => res.json({ code: 0, data: { id: Date.now(), name: 'uploaded_file' }, message: 'ok' }))
app.delete('/api/media/:id', (req, res) => res.json({ code: 0, data: null, message: 'ok' }))
app.post('/api/media/:id/restore', (req, res) => res.json({ code: 0, data: null, message: 'ok' }))
app.delete('/api/media/:id/permanent', (req, res) => res.json({ code: 0, data: null, message: 'ok' }))
app.put('/api/media/:id', (req, res) => res.json({ code: 0, data: { ...req.body }, message: 'ok' }))

// Categories & Tags
app.get('/api/categories', (req, res) => res.json({ code: 0, data: mockCategories, message: 'ok' }))
app.post('/api/categories', (req, res) => res.json({ code: 0, data: { id: Date.now(), ...req.body }, message: 'ok' }))
app.put('/api/categories/:id', (req, res) => res.json({ code: 0, data: { ...req.body }, message: 'ok' }))
app.delete('/api/categories/:id', (req, res) => res.json({ code: 0, data: null, message: 'ok' }))
app.get('/api/tags', (req, res) => res.json({ code: 0, data: mockTags, message: 'ok' }))
app.post('/api/tags', (req, res) => res.json({ code: 0, data: { id: Date.now(), ...req.body }, message: 'ok' }))
app.delete('/api/tags/:id', (req, res) => res.json({ code: 0, data: null, message: 'ok' }))

// Logs
app.get('/api/logs', (req, res) => res.json({ code: 0, data: mockLogs, message: 'ok' }))

// Settings
app.get('/api/settings', (req, res) => res.json({ code: 0, data: {}, message: 'ok' }))
app.put('/api/settings', (req, res) => res.json({ code: 0, data: req.body, message: 'ok' }))

const PORT = process.env.MOCK_PORT || 3001
app.listen(PORT, () => { console.log('Mock server running on http://localhost:' + PORT) })
