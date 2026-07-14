<template>
  <div class="page-card program-editor-page" :class="{ 'is-canvas-tab': activeTab === 'canvas' }">
    <div class="editor-header">
      <div>
        <h2>{{ isEdit ? '编辑节目' : '新建节目' }}</h2>
        <p class="sub">画布编排素材，完成后可下发到设备 · 当前分辨率 {{ canvasLayout.resolution || `${canvasLayout.width}x${canvasLayout.height}` }}</p>
      </div>
      <div class="header-actions">
        <el-button @click="$router.back()">取消</el-button>
        <el-button type="primary" plain @click="handleSave('draft')" :loading="saving">保存草稿</el-button>
        <el-button type="primary" @click="handleSave('pending')" :loading="saving">提交审核</el-button>
        <el-button type="success" @click="deployVisible = true" :disabled="!isEdit && !createdId">下发设备</el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="editor-tabs">
      <el-tab-pane label="基本信息" name="basic">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="editor-form">
          <el-form-item label="节目名称" prop="title">
            <el-input v-model="form.title" placeholder="请输入节目名称" maxlength="100" />
          </el-form-item>
          <el-form-item label="简介" prop="description">
            <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入节目简介" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :xs="24" :sm="8">
              <el-form-item label="分类">
                <el-select v-model="form.categoryId" placeholder="选择分类" style="width: 100%">
                  <el-option label="纪录片" :value="1" />
                  <el-option label="综艺" :value="2" />
                  <el-option label="新闻" :value="3" />
                  <el-option label="电视剧" :value="4" />
                  <el-option label="动画" :value="5" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="8">
              <el-form-item label="版权">
                <el-input v-model="form.copyright" placeholder="版权信息" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="8">
              <el-form-item label="标签">
                <el-select v-model="form.tags" multiple filterable allow-create default-first-option style="width: 100%" placeholder="添加标签" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="画布编排" name="canvas">
        <div class="canvas-pane">
          <ProgramCanvas ref="canvasRef" v-model="canvasLayout" :media-items="mediaItems" />
        </div>
      </el-tab-pane>

      <el-tab-pane label="章节管理" name="chapters">
        <div class="chapters-toolbar">
          <el-button type="primary" size="small" @click="addChapter">
            <el-icon><Plus /></el-icon> 添加章节
          </el-button>
        </div>
        <draggable v-model="form.chapters" item-key="id" class="chapters-list" ghost-class="ghost" animation="200">
          <template #item="{ element: chapter, index }">
            <div class="chapter-item">
              <div class="chapter-drag-handle"><el-icon><Rank /></el-icon></div>
              <div class="chapter-content">
                <el-input v-model="chapter.title" placeholder="章节标题" style="flex: 1" />
                <el-input-number v-model="chapter.duration" :min="0" :step="60" size="small" style="width: 150px" />
              </div>
              <el-button link type="danger" size="small" @click="form.chapters.splice(index, 1)">删除</el-button>
            </div>
          </template>
        </draggable>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="deployVisible" title="下发到设备" width="640px" destroy-on-close>
      <p class="deploy-tip">选择要接收该节目的在线设备，下发后设备将同步播放画布编排内容。</p>
      <el-table :data="devices" v-loading="deviceStore.loading" @selection-change="onDeviceSelect" height="360">
        <el-table-column type="selection" width="48" :selectable="(row) => row.status !== 'offline'" />
        <el-table-column prop="name" label="设备名称" min-width="140" />
        <el-table-column prop="location" label="位置" width="120" />
        <el-table-column prop="resolution" label="分辨率" width="110" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="deployVisible = false">取消</el-button>
        <el-button type="primary" :loading="deploying" :disabled="!selectedDeviceIds.length" @click="handleDeploy">
          确认下发 ({{ selectedDeviceIds.length }})
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onActivated, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Rank } from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
import ProgramCanvas from '@/components/program/ProgramCanvas.vue'
import { useProgramStore } from '@/stores/program'
import { useMediaStore } from '@/stores/media'
import { useDeviceStore } from '@/stores/device'
import type { Device, DeviceStatus, ProgramCanvasLayout } from '@/types'

const route = useRoute()
const router = useRouter()
const programStore = useProgramStore()
const mediaStore = useMediaStore()
const deviceStore = useDeviceStore()

const isEdit = computed(() => !!route.params.id)
const formRef = ref()
const canvasRef = ref<{ fitZoom?: () => void } | null>(null)
const activeTab = ref('canvas')
const saving = ref(false)
const deploying = ref(false)
const deployVisible = ref(false)
const createdId = ref<number | null>(null)
const selectedDeviceIds = ref<number[]>([])

const form = reactive({
  title: '',
  description: '',
  coverImage: '',
  categoryId: 1,
  tags: [] as string[],
  creators: [] as string[],
  copyright: '© 2026 CMS',
  chapters: [] as { id: number; title: string; duration: number; sortOrder: number; content: string }[],
  assets: [] as { id: number; mediaId: number; type: 'cover' | 'trailer' | 'attachment' | 'poster'; isCover: boolean; sortOrder: number }[],
})

const canvasLayout = ref<ProgramCanvasLayout>({
  width: 1280,
  height: 720,
  resolution: '1280x720',
  background: '#0b1220',
  shapes: [],
})

const mediaItems = computed(() => mediaStore.items)
const devices = computed(() => deviceStore.devices)

const rules = {
  title: [{ required: true, message: '请输入节目名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入简介', trigger: 'blur' }],
}

function addChapter() {
  form.chapters.push({
    id: Date.now(),
    title: `新章节 ${form.chapters.length + 1}`,
    duration: 1800,
    sortOrder: form.chapters.length,
    content: '',
  })
}

function statusTag(status: DeviceStatus) {
  return ({ online: 'success', offline: 'info', syncing: 'warning', error: 'danger' } as const)[status]
}

function statusText(status: DeviceStatus) {
  return ({ online: '在线', offline: '离线', syncing: '同步中', error: '异常' } as const)[status]
}

function onDeviceSelect(rows: Device[]) {
  selectedDeviceIds.value = rows.map((r) => r.id)
}

async function handleSave(status: string) {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid && activeTab.value === 'basic') {
    activeTab.value = 'basic'
    return
  }
  if (!form.title) {
    ElMessage.warning('请填写节目名称')
    activeTab.value = 'basic'
    return
  }

  saving.value = true
  try {
    const payload = {
      ...form,
      status,
      resolution: canvasLayout.value.resolution || `${canvasLayout.value.width}x${canvasLayout.value.height}`,
      canvas: {
        ...canvasLayout.value,
        resolution: canvasLayout.value.resolution || `${canvasLayout.value.width}x${canvasLayout.value.height}`,
      },
      assets: canvasLayout.value.shapes
        .filter((s) => s.mediaId)
        .map((s, i) => ({
          id: Date.now() + i,
          mediaId: s.mediaId!,
          type: 'attachment' as const,
          isCover: i === 0,
          sortOrder: i,
        })),
    }

    if (isEdit.value) {
      await programStore.update(Number(route.params.id), payload)
      ElMessage.success('保存成功')
    } else if (createdId.value) {
      await programStore.update(createdId.value, payload)
      ElMessage.success('保存成功')
    } else {
      const created = await programStore.create(payload)
      createdId.value = created.id
      ElMessage.success('创建成功')
      router.replace(`/programs/${created.id}/edit`)
    }
  } finally {
    saving.value = false
  }
}

async function handleDeploy() {
  const programId = Number(route.params.id) || createdId.value
  if (!programId) {
    ElMessage.warning('请先保存节目')
    return
  }
  if (!selectedDeviceIds.value.length) return

  deploying.value = true
  try {
    await handleSave('published')
    const result = await deviceStore.deploy({
      programId,
      deviceIds: selectedDeviceIds.value,
    })
    ElMessage.success(`下发完成：成功 ${result.success} 台，失败 ${result.failed} 台`)
    deployVisible.value = false
  } finally {
    deploying.value = false
  }
}

onMounted(async () => {
  await Promise.all([mediaStore.fetchList({ pageSize: 200 }), deviceStore.fetchList({ pageSize: 200 })])
  if (route.query.tab === 'canvas') activeTab.value = 'canvas'
  if (route.query.deploy === '1') deployVisible.value = true
  if (isEdit.value) {
    const detail = await programStore.fetchDetail(Number(route.params.id))
    Object.assign(form, {
      title: detail.title,
      description: detail.description,
      coverImage: detail.coverImage,
      categoryId: detail.categoryId,
      tags: detail.tags || [],
      creators: detail.creators || [],
      copyright: detail.copyright,
      chapters: detail.chapters || [],
      assets: detail.assets || [],
    })
    if (detail.canvas) {
      const canvas = { ...detail.canvas }
      if (!canvas.resolution) canvas.resolution = `${canvas.width}x${canvas.height}`
      // 兼容旧数据：resolution 字符串优先同步宽高
      if (detail.resolution && /^\d+x\d+$/.test(detail.resolution)) {
        canvas.resolution = detail.resolution
        const [rw, rh] = detail.resolution.split('x').map(Number)
        if (rw && rh) {
          canvas.width = rw
          canvas.height = rh
        }
      }
      canvasLayout.value = canvas
    } else if (detail.resolution && /^\d+x\d+$/.test(detail.resolution)) {
      const [rw, rh] = detail.resolution.split('x').map(Number)
      canvasLayout.value = {
        ...canvasLayout.value,
        width: rw,
        height: rh,
        resolution: detail.resolution,
      }
    } else if (detail.assets?.length) {
      canvasLayout.value.shapes = detail.assets.map((a, i) => {
        const media = mediaStore.items.find((m) => m.id === a.mediaId)
        return {
          id: 's_' + a.id,
          type: 'rect' as const,
          x: 80 + (i % 3) * 280,
          y: 80 + Math.floor(i / 3) * 200,
          width: 240,
          height: 160,
          fill: '#0d948833',
          stroke: '#0d9488',
          mediaId: a.mediaId,
          mediaUrl: media?.url || media?.thumbnail,
          mediaName: media?.name,
        }
      })
    }
  }
  requestAnimationFrame(() => canvasRef.value?.fitZoom?.())
})

onActivated(() => {
  requestAnimationFrame(() => canvasRef.value?.fitZoom?.())
})

watch(activeTab, (tab) => {
  if (tab === 'canvas') {
    nextTick(() => requestAnimationFrame(() => canvasRef.value?.fitZoom?.()))
  }
})
</script>

<style scoped>
.program-editor-page {
  padding: 8px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.program-editor-page.is-canvas-tab {
  height: calc(100vh - 104px);
  max-height: calc(100vh - 104px);
  overflow: hidden;
}
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}
.editor-header h2 { margin: 0; font-size: 20px; }
.sub { margin: 6px 0 0; color: var(--text-secondary); font-size: 13px; }
.header-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.editor-tabs {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.program-editor-page.is-canvas-tab :deep(.el-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.program-editor-page.is-canvas-tab :deep(.el-tabs__header) {
  flex-shrink: 0;
  margin-bottom: 8px;
}
.program-editor-page.is-canvas-tab :deep(.el-tabs__content) {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.program-editor-page.is-canvas-tab :deep(.el-tab-pane) {
  height: 100%;
}
.canvas-pane {
  height: 100%;
  min-height: 0;
}
.editor-form { max-width: 900px; }
.chapters-toolbar { margin-bottom: 12px; }
.chapters-list { display: flex; flex-direction: column; gap: 8px; }
.chapter-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--surface-elevated);
}
.chapter-drag-handle { cursor: grab; color: var(--text-secondary); }
.chapter-content { flex: 1; display: flex; align-items: center; gap: 12px; }
.deploy-tip { margin: 0 0 12px; color: var(--text-secondary); font-size: 13px; }

@media (max-width: 960px) {
  .program-editor-page.is-canvas-tab {
    height: auto;
    max-height: none;
    min-height: calc(100vh - 120px);
  }
  .program-editor-page.is-canvas-tab :deep(.el-tabs__content) {
    overflow: visible;
  }
}
</style>
