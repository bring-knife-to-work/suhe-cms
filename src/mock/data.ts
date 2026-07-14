import type { User, Article, Program, MediaItem, CategoryNode, Tag, OperationLog, DashboardStats } from '@/types'
import { ArticleStatus, MediaType, ProgramStatus, Role } from '@/constants/enums'

export const mockUsers: User[] = [
  { id: 1, username: 'admin', nickname: '管理员', email: 'admin@cms.com', role: Role.ADMIN, avatar: '', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 2, username: 'editor1', nickname: '张三', email: 'editor@cms.com', role: Role.EDITOR, avatar: '', createdAt: '2024-02-15', updatedAt: '2024-03-01' },
  { id: 3, username: 'reviewer1', nickname: '李四', email: 'reviewer@cms.com', role: Role.REVIEWER, avatar: '', createdAt: '2024-03-01', updatedAt: '2024-03-15' },
  { id: 4, username: 'guest1', nickname: '王五', email: 'guest@cms.com', role: Role.GUEST, avatar: '', createdAt: '2024-04-01', updatedAt: '2024-04-01' },
]

export const mockArticles: Article[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  title: `这篇文章的标题是第 ${i + 1} 篇`,
  summary: `这是第 ${i + 1} 篇文章的摘要内容，简要介绍文章的核心要点。`,
  content: `<p>这是第 ${i + 1} 篇文章的正文内容。</p><p>这里包含丰富的文本信息和排版。</p>`,
  authorId: (i % 4) + 1,
  authorName: mockUsers[i % 4]?.nickname || '未知',
  coverImage: '',
  categoryId: (i % 5) + 1,
  category: ['科技', '文化', '生活', '娱乐', '体育'][i % 5],
  tags: ['推荐', '热门', '精选'].slice(0, (i % 3) + 1),
  status: [ArticleStatus.DRAFT, ArticleStatus.PENDING, ArticleStatus.PUBLISHED, ArticleStatus.REJECTED][i % 4],
  publishTime: i % 3 === 0 ? '2024-07-01' : null,
  viewCount: Math.floor(Math.random() * 5000),
  createdAt: `2024-0${(i % 6) + 1}-${String((i % 28) + 1).padStart(2, '0')}`,
  updatedAt: `2024-0${(i % 6) + 1}-${String((i % 28) + 1).padStart(2, '0')}`,
}))

export const mockPrograms: Program[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  title: `节目名称 ${i + 1}`,
  description: `这是第 ${i + 1} 个节目的详细描述信息。`,
  coverImage: '',
  categoryId: (i % 5) + 1,
  category: ['纪录片', '综艺', '新闻', '电视剧', '动画'][i % 5],
  tags: ['热门', '原创', '独家'].slice(0, (i % 3) + 1),
  creators: ['导演A', '编剧B', '制片人C'].slice(0, (i % 3) + 1),
  copyright: '© 2024 CMS Platform',
  status: [ProgramStatus.DRAFT, ProgramStatus.PENDING, ProgramStatus.PUBLISHED, ProgramStatus.ARCHIVED][i % 4],
  publishTime: i % 2 === 0 ? '2024-07-01' : null,
  chapters: Array.from({ length: (i % 5) + 1 }, (_, j) => ({
    id: i * 100 + j + 1,
    title: `第 ${j + 1} 集`,
    sortOrder: j,
    duration: 1800 + j * 60,
    content: '',
  })),
  assets: [
    { id: i * 10 + 1, mediaId: i + 1, type: 'cover' as const, isCover: true, sortOrder: 0 },
    { id: i * 10 + 2, mediaId: i + 101, type: 'trailer' as const, isCover: false, sortOrder: 1 },
  ],
  version: Math.floor(Math.random() * 10) + 1,
  history: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => ({
    id: j + 1,
    version: j + 1,
    title: `版本 ${j + 1}`,
    description: `第 ${j + 1} 次编辑`,
    createdAt: `2024-0${(j % 6) + 1}-01`,
    createdBy: mockUsers[j % 4]?.nickname || '未知',
  })),
  createdAt: `2024-0${(i % 6) + 1}-01`,
  updatedAt: `2024-0${(i % 6) + 1}-15`,
}))

export const mockMedia: MediaItem[] = Array.from({ length: 80 }, (_, i) => ({
  id: i + 1,
  name: `素材文件_${i + 1}.${['jpg', 'png', 'mp4', 'mp3', 'pdf'][i % 5]}`,
  url: '',
  thumbnail: '',
  type: [MediaType.IMAGE, MediaType.VIDEO, MediaType.AUDIO, MediaType.DOCUMENT][i % 4],
  size: Math.floor(Math.random() * 50000000) + 100000,
  width: i % 3 === 0 ? 1920 : undefined,
  height: i % 3 === 0 ? 1080 : undefined,
  duration: i % 4 === 1 ? Math.floor(Math.random() * 3600) : undefined,
  tags: ['封面', '宣传', '附件'].slice(0, (i % 3) + 1),
  folderId: (i % 5) + 1,
  folder: ['图片', '视频', '音频', '文档', '其他'][i % 5],
  uploader: mockUsers[i % 4]?.nickname || '未知',
  usedBy: i % 3 === 0 ? [Math.floor(Math.random() * 30) + 1] : [],
  createdAt: `2024-0${(i % 6) + 1}-${String((i % 28) + 1).padStart(2, '0')}`,
  updatedAt: `2024-0${(i % 6) + 1}-${String((i % 28) + 1).padStart(2, '0')}`,
}))

export const mockCategories: CategoryNode[] = [
  { id: 1, name: '科技', parentId: null, sort: 1, children: [
    { id: 11, name: '人工智能', parentId: 1, sort: 1, children: [] },
    { id: 12, name: '云计算', parentId: 1, sort: 2, children: [] },
  ]},
  { id: 2, name: '文化', parentId: null, sort: 2, children: [
    { id: 21, name: '历史文化', parentId: 2, sort: 1, children: [] },
  ]},
  { id: 3, name: '生活', parentId: null, sort: 3, children: [] },
  { id: 4, name: '娱乐', parentId: null, sort: 4, children: [] },
  { id: 5, name: '体育', parentId: null, sort: 5, children: [] },
]

export const mockTags: Tag[] = [
  { id: 1, name: '推荐', usageCount: 15 },
  { id: 2, name: '热门', usageCount: 23 },
  { id: 3, name: '精选', usageCount: 8 },
  { id: 4, name: '原创', usageCount: 12 },
  { id: 5, name: '独家', usageCount: 5 },
]

export const mockLogs: OperationLog[] = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  userId: (i % 4) + 1,
  userName: mockUsers[i % 4]?.nickname || '未知',
  action: ['创建', '更新', '删除', '发布', '审核', '登录'][i % 6],
  targetType: ['文章', '节目', '素材', '分类'][i % 4],
  targetId: Math.floor(Math.random() * 100) + 1,
  description: `${mockUsers[i % 4]?.nickname} ${['创建','更新','删除','发布','审核'][i%5]}了${['文章','节目','素材'][i%3]} #${Math.floor(Math.random()*100)+1}`,
  ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
  createdAt: `2024-0${(i % 6) + 1}-${String((i % 28) + 1).padStart(2, '0')}T${String(i % 24).padStart(2, '0')}:00:00`,
}))

export const mockDashboard: DashboardStats = {
  totalArticles: 1258,
  totalPrograms: 367,
  totalMedia: 5432,
  todayUpdates: 23,
  pendingReview: 12,
  publishedCount: 980,
  draftCount: 200,
  rejectedCount: 78,
  mediaBreakdown: [
    { type: '图片', count: 2500 },
    { type: '视频', count: 1200 },
    { type: '音频', count: 900 },
    { type: '文档', count: 832 },
  ],
  recentActivities: Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    user: mockUsers[i % 4]?.nickname || '未知',
    action: ['创建了文章', '发布了节目', '上传了素材', '审核了内容'][i % 4],
    target: ['《标题${i+1}》', '《节目${i+1}》', '素材.jpg', '分类管理'][i % 4],
    time: `${i}分钟前`,
  })),
}
