import type { Role, ArticleStatus, MediaType, ProgramStatus } from '@/constants/enums'

export interface User {
  id: number
  username: string
  nickname: string
  email: string
  role: Role
  avatar: string
  createdAt: string
  updatedAt: string
}

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  user: User
}

export interface Article {
  id: number
  title: string
  summary: string
  content: string
  authorId: number
  authorName: string
  coverImage: string
  categoryId: number
  category: string
  tags: string[]
  status: ArticleStatus
  publishTime: string | null
  viewCount: number
  createdAt: string
  updatedAt: string
}

export interface Program {
  id: number
  title: string
  description: string
  coverImage: string
  categoryId: number
  category: string
  tags: string[]
  creators: string[]
  copyright: string
  status: ProgramStatus
  publishTime: string | null
  chapters: ProgramChapter[]
  assets: ProgramAsset[]
  version: number
  history: ProgramHistory[]
  createdAt: string
  updatedAt: string
}

export interface ProgramChapter {
  id: number
  title: string
  sortOrder: number
  duration: number
  content: string
}

export interface ProgramAsset {
  id: number
  mediaId: number
  type: 'cover' | 'trailer' | 'attachment' | 'poster'
  isCover: boolean
  sortOrder: number
}

export interface ProgramHistory {
  id: number
  version: number
  title: string
  description: string
  createdAt: string
  createdBy: string
}

export interface MediaItem {
  id: number
  name: string
  url: string
  thumbnail: string
  type: MediaType
  size: number
  width: number
  height: number
  duration: number
  tags: string[]
  folderId: number
  folder: string
  uploader: string
  usedBy: number[]
  createdAt: string
  updatedAt: string
}

export interface MediaFolder {
  id: number
  name: string
  parentId: number | null
  children: MediaFolder[]
}

export interface CategoryNode {
  id: number
  name: string
  parentId: number | null
  sort: number
  children: CategoryNode[]
}

export interface Tag {
  id: number
  name: string
  usageCount: number
}

export interface OperationLog {
  id: number
  userId: number
  userName: string
  action: string
  targetType: string
  targetId: number
  description: string
  ip: string
  createdAt: string
}

export interface DashboardStats {
  totalArticles: number
  totalPrograms: number
  totalMedia: number
  todayUpdates: number
  pendingReview: number
  publishedCount: number
  draftCount: number
  rejectedCount: number
  mediaBreakdown: { type: string; count: number }[]
  recentActivities: ActivityItem[]
}

export interface ActivityItem {
  id: number
  user: string
  action: string
  target: string
  time: string
}

export interface SystemConfig {
  siteName: string
  logo: string
  defaultCategoryId: number
  maxUploadSize: number
  allowedFormats: string[]
}
