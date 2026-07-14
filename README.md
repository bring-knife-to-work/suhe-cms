# suhe CMS

基于 Vue 3 的内容投放与节目编排管理后台（节目画布编辑 · 素材填充 · 设备下发）。

仓库地址：[bring-knife-to-work/suhe-cms](https://github.com/bring-knife-to-work/suhe-cms)

在线预览（GitHub Pages）：[https://bring-knife-to-work.github.io/suhe-cms/](https://bring-knife-to-work.github.io/suhe-cms/)

> Pages 前端演示默认使用 Mock；本地完整联调请同时启动 Mock 服务。

## 功能概览

- **登录认证**：JWT Token、记住登录态、路由守卫
- **仪表盘**：内容统计与 ECharts 可视化
- **信息管理**：文章列表分页、筛选、发布与批量操作
- **节目管理**：分页列表、分辨率字段、快捷进入画布/下发
- **画布编排**：
  - 矩形 / 圆 / 椭圆 / 三角 / 文本区域
  - 素材点击填充、选中缩放、层级置顶/置底
  - 分辨率预设与自定义，区域不可移出画布
  - 缩放适配窗口、可开关小地图
- **设备管理**：设备列表分页、在线下发节目
- **素材管理**：网格/列表视图、分页筛选、上传预览
- **分类标签 / 用户 / 操作日志 / 系统设置**
- **主题**：白天 / 黑夜模式切换

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 + TypeScript + Composition API |
| 构建 | Vite 6 |
| 状态 | Pinia |
| 路由 | Vue Router 4 |
| UI | Element Plus |
| HTTP | Axios |
| 富文本 | Tiptap |
| 图表 | ECharts 5 |
| Mock | Express（`mock/server.cjs`） |

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装与启动

```bash
git clone git@github.com:bring-knife-to-work/suhe-cms.git
cd suhe-cms
npm install
npm run dev
```

默认会同时启动：

- Mock API：`http://localhost:3001`
- 前端（Vite）：`http://localhost:9999`（端口占用时可能自动顺延）

### 常用脚本

```bash
npm run dev          # Mock + 前端开发
npm run build        # 类型检查 + 生产构建
npm run build:pages  # GitHub Pages 构建（/suhe-cms/ 子路径）
npm run preview      # 预览构建产物
npm run typecheck    # 仅类型检查
npm run lint         # ESLint
```

### 环境变量

参考 `.env.example`：

```env
VITE_API_BASE_URL=/api
VITE_APP_TITLE=suhe CMS
```

GitHub Pages 构建会自动设置 `VITE_BASE_PATH=/suhe-cms/`。

## 演示账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 编辑 | editor1 | editor123 |
| 审核员 | reviewer1 | reviewer123 |
| 访客 | guest1 | guest123 |

## 目录结构

```text
suhe-cms/
├── mock/                 # Express Mock API
├── src/
│   ├── components/
│   │   ├── common/       # 分页等公共组件
│   │   └── program/      # 节目画布编辑器
│   ├── composables/      # 分页等组合式函数
│   ├── layouts/          # 主布局
│   ├── router/
│   ├── stores/           # Pinia（含 device）
│   ├── styles/
│   ├── types/
│   ├── utils/
│   └── views/
│       ├── auth/
│       ├── dashboard/
│       ├── article/
│       ├── program/
│       ├── device/
│       ├── media/
│       ├── category/
│       ├── user/
│       └── settings/
├── .github/workflows/    # GitHub Pages 部署
└── package.json
```


> Pages 为纯静态前端，无 Mock API；登录与数据联调请使用本地 `npm run dev`。

## License

MIT
