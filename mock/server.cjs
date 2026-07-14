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
  resolution: ['1920x1080', '1280x720', '1080x1920', '3840x2160'][i % 4],
  canvas: {
    width: [1920, 1280, 1080, 3840][i % 4],
    height: [1080, 720, 1920, 2160][i % 4],
    resolution: ['1920x1080', '1280x720', '1080x1920', '3840x2160'][i % 4],
    background: '#0b1220',
    shapes: [],
  },
  chapters: [{ id: i * 100 + 1, title: '第1集', sortOrder: 0, duration: 1800 }],
  assets: [{ id: i * 10 + 1, mediaId: i + 1, type: 'cover', isCover: true }],
  version: 1, history: [{ id: 1, version: 1, title: 'v1', description: '初始版本', createdAt: '2024-01-01', createdBy: '管理员' }],
  createdAt: '2024-01-01', updatedAt: '2024-01-01',
}))

const mockMedia = Array.from({ length: 80 }, (_, i) => ({
  id: i + 1, name: '素材_' + (i + 1) + (i % 4 === 1 ? '.mp4' : i % 4 === 2 ? '.mp3' : i % 4 === 3 ? '.pdf' : '.jpg'),
  url: 'https://picsum.photos/seed/cms' + (i + 1) + '/640/360',
  thumbnail: 'https://picsum.photos/seed/cms' + (i + 1) + '/320/180',
  type: ['image', 'video', 'audio', 'document'][i % 4],
  size: Math.floor(Math.random() * 50000000) + 100000,
  width: 640, height: 360, duration: i % 4 === 1 ? 120 : 0,
  tags: ['默认'], folderId: (i % 5) + 1, folder: ['图片', '视频', '音频', '文档', '其他'][i % 5],
  uploader: '管理员', usedBy: [], createdAt: '2024-01-01', updatedAt: '2024-01-01',
}))

const mockDevices = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: ['大厅主屏', '电梯侧屏', '会议室A', '前台窄屏', '展厅左屏', '展厅右屏'][i % 6] + (i > 5 ? ' #' + (i - 5) : ''),
  code: 'DEV-' + String(i + 1).padStart(3, '0'),
  location: ['一楼大厅', '二楼电梯', '三楼会议室', '前台', '展厅'][i % 5],
  group: ['默认分组', '大厅组', '展厅组'][i % 3],
  status: ['online', 'online', 'offline', 'syncing', 'online', 'error'][i % 6],
  resolution: ['1920x1080', '1280x720', '3840x2160'][i % 3],
  lastSeen: '2026-07-14 12:' + String(10 + i).padStart(2, '0') + ':00',
  currentProgramId: i % 3 === 0 ? (i % 10) + 1 : null,
  currentProgramTitle: i % 3 === 0 ? '节目名称 ' + ((i % 10) + 1) : null,
  createdAt: '2026-01-01',
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

const passwords = { admin: 'admin123', editor1: 'editor123', reviewer1: 'reviewer123', guest1: 'guest123' }

function paginate(list, query) {
  const total = list.length
  const hasPaging = query.page !== undefined || query.pageSize !== undefined
  if (!hasPaging) {
    return { list, total, page: 1, pageSize: total || 10 }
  }
  const page = Math.max(1, parseInt(query.page, 10) || 1)
  const pageSize = Math.max(1, parseInt(query.pageSize, 10) || 10)
  const start = (page - 1) * pageSize
  return {
    list: list.slice(start, start + pageSize),
    total,
    page,
    pageSize,
  }
}

// Auth
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body
  const user = mockUsers.find(u => u.username === username)
  if (user && passwords[username] === password) {
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
  res.json({ code: 0, data: paginate(filtered, req.query), message: 'ok' })
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
app.get('/api/programs', (req, res) => {
  let filtered = [...mockPrograms]
  if (req.query.keyword) filtered = filtered.filter(p => p.title.includes(String(req.query.keyword)))
  if (req.query.status) filtered = filtered.filter(p => p.status === req.query.status)
  res.json({ code: 0, data: paginate(filtered, req.query), message: 'ok' })
})
app.get('/api/programs/:id', (req, res) => { const p = mockPrograms.find(x => x.id === parseInt(req.params.id)); res.json({ code: 0, data: p || mockPrograms[0], message: 'ok' }) })
app.post('/api/programs', (req, res) => { const n = { id: Date.now(), ...req.body, createdAt: new Date().toISOString().slice(0, 10) }; mockPrograms.push(n); res.json({ code: 0, data: n, message: 'ok' }) })
app.put('/api/programs/:id', (req, res) => {
  const i = mockPrograms.findIndex(x => x.id === parseInt(req.params.id))
  if (i >= 0) {
    mockPrograms[i] = { ...mockPrograms[i], ...req.body, updatedAt: new Date().toISOString().slice(0, 10) }
    res.json({ code: 0, data: mockPrograms[i], message: 'ok' })
  } else {
    res.json({ code: 0, data: req.body, message: 'ok' })
  }
})
app.delete('/api/programs/:id', (req, res) => { const i = mockPrograms.findIndex(x => x.id === parseInt(req.params.id)); if (i >= 0) mockPrograms.splice(i, 1); res.json({ code: 0, data: null, message: 'ok' }) })
app.post('/api/programs/:id/chapters', (req, res) => res.json({ code: 0, data: { id: Date.now(), ...req.body }, message: 'ok' }))
app.put('/api/programs/:pid/chapters/:cid', (req, res) => res.json({ code: 0, data: { ...req.body }, message: 'ok' }))
app.delete('/api/programs/:pid/chapters/:cid', (req, res) => res.json({ code: 0, data: null, message: 'ok' }))
app.post('/api/programs/:id/chapters/reorder', (req, res) => res.json({ code: 0, data: null, message: 'ok' }))
app.post('/api/programs/:id/assets', (req, res) => res.json({ code: 0, data: { id: Date.now(), ...req.body }, message: 'ok' }))
app.put('/api/programs/:id/cover', (req, res) => res.json({ code: 0, data: null, message: 'ok' }))
app.post('/api/programs/:id/rollback', (req, res) => res.json({ code: 0, data: { version: req.body.version }, message: 'ok' }))

// Devices
app.get('/api/devices', (req, res) => {
  let list = [...mockDevices]
  if (req.query.keyword) {
    const kw = String(req.query.keyword)
    list = list.filter(d => d.name.includes(kw) || d.code.includes(kw) || d.location.includes(kw))
  }
  if (req.query.status) list = list.filter(d => d.status === req.query.status)
  res.json({ code: 0, data: paginate(list, req.query), message: 'ok' })
})
app.post('/api/devices', (req, res) => {
  const n = {
    id: Date.now(),
    status: 'online',
    lastSeen: new Date().toISOString().slice(0, 19).replace('T', ' '),
    currentProgramId: null,
    currentProgramTitle: null,
    createdAt: new Date().toISOString().slice(0, 10),
    resolution: '1920x1080',
    group: '默认分组',
    location: '',
    ...req.body,
  }
  mockDevices.unshift(n)
  res.json({ code: 0, data: n, message: 'ok' })
})
app.put('/api/devices/:id', (req, res) => {
  const i = mockDevices.findIndex(x => x.id === parseInt(req.params.id))
  if (i >= 0) {
    mockDevices[i] = { ...mockDevices[i], ...req.body }
    res.json({ code: 0, data: mockDevices[i], message: 'ok' })
  } else {
    res.json({ code: 404, data: null, message: '设备不存在' })
  }
})
app.delete('/api/devices/:id', (req, res) => {
  const i = mockDevices.findIndex(x => x.id === parseInt(req.params.id))
  if (i >= 0) mockDevices.splice(i, 1)
  res.json({ code: 0, data: null, message: 'ok' })
})
app.post('/api/devices/deploy', (req, res) => {
  const { programId, deviceIds } = req.body || {}
  const program = mockPrograms.find(p => p.id === Number(programId))
  let success = 0
  let failed = 0
  ;(deviceIds || []).forEach((id) => {
    const i = mockDevices.findIndex(d => d.id === Number(id))
    if (i >= 0 && mockDevices[i].status !== 'offline') {
      mockDevices[i].status = 'syncing'
      mockDevices[i].currentProgramId = Number(programId)
      mockDevices[i].currentProgramTitle = program?.title || ('节目 #' + programId)
      success += 1
      setTimeout(() => {
        if (mockDevices[i]) mockDevices[i].status = 'online'
      }, 1500)
    } else {
      failed += 1
    }
  })
  res.json({ code: 0, data: { success, failed }, message: 'ok' })
})

// Media
app.get('/api/media', (req, res) => {
  let list = [...mockMedia]
  if (req.query.keyword) list = list.filter(m => m.name.includes(String(req.query.keyword)))
  if (req.query.type) list = list.filter(m => m.type === req.query.type)
  if (req.query.folderId) list = list.filter(m => String(m.folderId) === String(req.query.folderId))
  res.json({ code: 0, data: paginate(list, req.query), message: 'ok' })
})
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
app.get('/api/logs', (req, res) => {
  let list = [...mockLogs]
  if (req.query.keyword) list = list.filter(l => l.userName.includes(String(req.query.keyword)))
  if (req.query.action) list = list.filter(l => l.action === req.query.action)
  res.json({ code: 0, data: paginate(list, req.query), message: 'ok' })
})

// Users
app.get('/api/users', (req, res) => {
  let list = [...mockUsers]
  if (req.query.keyword) {
    const kw = String(req.query.keyword)
    list = list.filter(u => u.username.includes(kw) || u.nickname.includes(kw) || u.email.includes(kw))
  }
  res.json({ code: 0, data: paginate(list, req.query), message: 'ok' })
})
app.post('/api/users', (req, res) => {
  const n = { id: Date.now(), avatar: '', createdAt: new Date().toISOString().slice(0, 10), updatedAt: new Date().toISOString().slice(0, 10), ...req.body }
  mockUsers.push(n)
  res.json({ code: 0, data: n, message: 'ok' })
})
app.put('/api/users/:id', (req, res) => {
  const i = mockUsers.findIndex(x => x.id === parseInt(req.params.id))
  if (i >= 0) {
    mockUsers[i] = { ...mockUsers[i], ...req.body, updatedAt: new Date().toISOString().slice(0, 10) }
    res.json({ code: 0, data: mockUsers[i], message: 'ok' })
  } else res.json({ code: 404, data: null, message: '用户不存在' })
})
app.delete('/api/users/:id', (req, res) => {
  const i = mockUsers.findIndex(x => x.id === parseInt(req.params.id))
  if (i >= 0) mockUsers.splice(i, 1)
  res.json({ code: 0, data: null, message: 'ok' })
})

// Settings
app.get('/api/settings', (req, res) => res.json({ code: 0, data: {}, message: 'ok' }))
app.put('/api/settings', (req, res) => res.json({ code: 0, data: req.body, message: 'ok' }))

const PORT = process.env.MOCK_PORT || 3001
app.listen(PORT, () => { console.log('Mock server running on http://localhost:' + PORT) })
