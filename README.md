# Vue CMS Admin

基于 Vue 3 的内容管理后台 - 节目编辑与素材管理平台

## 项目简介

Vue CMS Admin 是一个面向媒体/运营人员的开源内容管理系统，提供：

- 信息发布管理 - 文章/图文的 CRUD、富文本编辑、审核流、批量操作
- 节目编辑 - 结构化多媒体内容管理，支持多章节、时间线标记、版本控制
- 素材管理 - 统一的图片/视频/音频/文档仓库
- 分类标签 - 无限级分类树、自由标签体系
- 用户权限 - 基于角色的访问控制（RBAC）
- 仪表盘 - ECharts 可视化数据统计
- 系统设置 - 站点配置、上传规则、安全策略

## 技术栈

- 框架: Vue 3 (Composition API) + TypeScript
- 构建: Vite 5
- 状态管理: Pinia
- 路由: Vue Router 4
- UI 组件: Element Plus
- HTTP: Axios
- 富文本: WangEditor 5
- 图表: ECharts 5
- 测试: Vitest + Vue Test Utils
- Lint: ESLint + Prettier

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

`
cd cms-admin
npm install
`

### 启动开发服务器

`
npm run dev
`

访问 http://localhost:9999

### 构建生产版本

`
npm run build
`

## 演示账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 编辑 | editor1 | admin123 |
| 审核员 | reviewer1 | admin123 |

## 目录结构

`
cms-admin/
src/
  api/           # API 请求封装
  assets/        # 静态资源
  components/    # 公共组件
  constants/     # 常量枚举
  i18n/          # 国际化
  layouts/       # 布局组件
  mock/          # Mock 数据
  router/        # 路由配置
  stores/        # Pinia 状态管理
  styles/        # 全局样式
  types/         # TypeScript 类型定义
  utils/         # 工具函数
  views/         # 页面组件
    auth/        # 登录页
    dashboard/   # 仪表盘
    article/     # 文章管理
    program/     # 节目管理
    media/       # 素材管理
    category/    # 分类标签
    user/        # 用户管理
    settings/    # 系统设置
`

## 功能清单

- [x] 登录认证（JWT）
- [x] 仪表盘（统计数据 + ECharts 图表）
- [x] 文章管理（列表、搜索、筛选、批量操作）
- [x] 文章编辑（富文本编辑器、自动保存、定时发布）
- [x] 节目管理（列表、章节管理、版本控制）
- [x] 节目编辑（多章节、时间线、关联素材）
- [x] 素材管理（网格/列表视图、上传、预览）
- [x] 分类标签管理（无限级树、拖拽排序）
- [x] 用户管理（CRUD、角色分配）
- [x] 操作日志（筛选、追溯）
- [x] 系统设置（站点配置、上传规则）
- [x] 明/暗主题切换
- [x] 国际化（中/英文）
- [x] Mock 数据服务

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## License

MIT
