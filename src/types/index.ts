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

export type CanvasShapeType = 'rect' | 'circle' | 'ellipse' | 'triangle' | 'text'

export interface CanvasShape {
  id: string
  type: CanvasShapeType
  x: number
  y: number
  width: number
  height: number
  fill: string
  stroke: string
  mediaId?: number
  mediaUrl?: string
  mediaName?: string
  label?: string
  fontSize?: number
  fontColor?: string
  locked?: boolean
}

export interface ProgramCanvasLayout {
  width: number
  height: number
  /** 如 1920x1080，与 width/height 同步 */
  resolution: string
  background: string
  shapes: CanvasShape[]
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
  canvas?: ProgramCanvasLayout
  /** 节目输出分辨率，如 1920x1080 */
  resolution?: string
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

export type DeviceStatus = 'online' | 'offline' | 'syncing' | 'error'

export interface Device {
  id: number
  name: string
  code: string
  location: string
  group: string
  status: DeviceStatus
  resolution: string
  lastSeen: string
  currentProgramId: number | null
  currentProgramTitle: string | null
  createdAt: string
}

export interface DeviceDeployPayload {
  programId: number
  deviceIds: number[]
  scheduleAt?: string | null
}

export interface PageQuery {
  page?: number
  pageSize?: number
  keyword?: string
  [key: string]: unknown
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}
