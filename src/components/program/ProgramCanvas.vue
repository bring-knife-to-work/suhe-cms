<template>
  <div class="program-canvas" tabindex="0" ref="rootRef" @keydown="onKeydown">
    <div class="canvas-toolbar">
      <div class="tool-group">
        <span class="toolbar-label">分辨率</span>
        <el-select v-model="resolutionPreset" style="width: 160px" size="small" @change="onResolutionPresetChange">
          <el-option v-for="p in RESOLUTION_PRESETS" :key="p.value" :label="p.label" :value="p.value" />
          <el-option label="自定义" value="custom" />
        </el-select>
        <template v-if="resolutionPreset === 'custom'">
          <el-input-number v-model="customW" :min="320" :max="7680" :step="10" size="small" controls-position="right" style="width: 110px" />
          <span>×</span>
          <el-input-number v-model="customH" :min="240" :max="4320" :step="10" size="small" controls-position="right" style="width: 110px" />
          <el-button size="small" type="primary" @click="applyCustomResolution">应用</el-button>
        </template>
        <el-tag size="small" type="info">{{ layout.width }}×{{ layout.height }}</el-tag>
      </div>

      <div class="tool-group">
        <span class="toolbar-label">缩放</span>
        <el-button size="small" @click="zoomOut" :disabled="zoom <= 0.25">-</el-button>
        <el-slider v-model="zoomPercent" :min="25" :max="300" :step="5" style="width: 120px" @change="onZoomSlider" />
        <el-button size="small" @click="zoomIn" :disabled="zoom >= 3">+</el-button>
        <el-button size="small" @click="fitZoom">适配窗口</el-button>
        <el-tag v-if="autoFit" size="small" type="success" effect="plain">自适应中</el-tag>
        <span class="zoom-text">{{ Math.round(zoom * 100) }}%</span>
      </div>

      <div class="tool-group">
        <el-switch v-model="showMinimap" active-text="小地图" inline-prompt />
      </div>
    </div>

    <div class="canvas-toolbar secondary">
      <div class="tool-group">
        <el-button-group>
          <el-tooltip content="选择 (V)" placement="bottom">
            <el-button :type="tool === 'select' ? 'primary' : 'default'" @click="tool = 'select'">选择</el-button>
          </el-tooltip>
          <el-tooltip content="矩形 (R)" placement="bottom">
            <el-button :type="tool === 'rect' ? 'primary' : 'default'" @click="setTool('rect')">矩形</el-button>
          </el-tooltip>
          <el-tooltip content="圆形 (C)" placement="bottom">
            <el-button :type="tool === 'circle' ? 'primary' : 'default'" @click="setTool('circle')">圆形</el-button>
          </el-tooltip>
          <el-tooltip content="椭圆 (O)" placement="bottom">
            <el-button :type="tool === 'ellipse' ? 'primary' : 'default'" @click="setTool('ellipse')">椭圆</el-button>
          </el-tooltip>
          <el-tooltip content="三角形 (T)" placement="bottom">
            <el-button :type="tool === 'triangle' ? 'primary' : 'default'" @click="setTool('triangle')">三角</el-button>
          </el-tooltip>
          <el-tooltip content="文本框 (X)" placement="bottom">
            <el-button :type="tool === 'text' ? 'primary' : 'default'" @click="setTool('text')">文本</el-button>
          </el-tooltip>
        </el-button-group>
      </div>
      <div class="tool-group">
        <el-button :disabled="!selectedId" @click="bringToFront">置顶</el-button>
        <el-button :disabled="!selectedId" @click="bringForward">上移一层</el-button>
        <el-button :disabled="!selectedId" @click="sendBackward">下移一层</el-button>
        <el-button :disabled="!selectedId" @click="sendToBack">置底</el-button>
      </div>
      <div class="tool-group">
        <el-button :disabled="!selectedId || selected?.type === 'text'" @click="openMediaPicker">填充素材</el-button>
        <el-button :disabled="!selectedId || selected?.type !== 'text'" type="primary" plain @click="openTextEditor">编辑文本</el-button>
        <el-button :disabled="!selectedId" type="danger" plain @click="removeSelected">删除</el-button>
        <el-button @click="togglePreview" :type="previewing ? 'warning' : 'success'" plain>
          {{ previewing ? '退出预览 (P)' : '预览 (P)' }}
        </el-button>
      </div>
      <div class="shortcut-hint">区域不可移出画布 · 拖四角缩放 · +/- 缩放视图 · ]/[ 层级</div>
    </div>

    <div class="canvas-workspace" :class="{ previewing }">
      <div class="canvas-stage" ref="stageRef" @scroll="onStageScroll">
        <div
          class="canvas-frame"
          :style="{
            width: displayWidth + 'px',
            height: displayHeight + 'px',
            aspectRatio: `${layout.width} / ${layout.height}`,
          }"
        >
          <canvas
            ref="canvasRef"
            :width="layout.width"
            :height="layout.height"
            :style="{ width: displayWidth + 'px', height: displayHeight + 'px', cursor: canvasCursor }"
            @mousedown="onMouseDown"
            @mousemove="onMouseMove"
            @mouseup="onMouseUp"
            @mouseleave="onMouseUp"
            @dblclick="onDblClick"
            @wheel.prevent="onWheel"
          />
        </div>

        <div v-if="showMinimap && !previewing" class="minimap">
          <div class="minimap-header">
            <span>小地图</span>
            <el-button link size="small" @click="showMinimap = false">隐藏</el-button>
          </div>
          <canvas
            ref="minimapRef"
            class="minimap-canvas"
            :width="minimapSize.w"
            :height="minimapSize.h"
            @mousedown="onMinimapDown"
          />
          <p class="minimap-tip">点击定位视图</p>
        </div>
      </div>

      <aside v-if="!previewing" class="property-panel">
        <h4>画布 / 分辨率</h4>
        <div class="prop-row"><span>输出</span><strong>{{ layout.resolution || `${layout.width}x${layout.height}` }}</strong></div>
        <div class="prop-row"><span>比例</span><strong>{{ aspectText }}</strong></div>

        <h4 class="media-title">属性</h4>
        <template v-if="selected">
          <div class="prop-row"><span>类型</span><strong>{{ shapeLabel(selected.type) }}</strong></div>
          <div class="prop-row"><span>X</span><el-input-number v-model="selected.x" :step="1" size="small" @change="onPropChange" /></div>
          <div class="prop-row"><span>Y</span><el-input-number v-model="selected.y" :step="1" size="small" @change="onPropChange" /></div>
          <div class="prop-row"><span>宽</span><el-input-number v-model="selected.width" :min="20" :step="1" size="small" @change="onPropChange" /></div>
          <div class="prop-row"><span>高</span><el-input-number v-model="selected.height" :min="20" :step="1" size="small" @change="onPropChange" /></div>
          <div class="prop-row"><span>填充色</span><el-color-picker v-model="selected.fill" size="small" @change="emitUpdate" /></div>

          <template v-if="selected.type === 'text'">
            <div class="prop-row prop-row-block">
              <span>文本内容</span>
              <el-input v-model="selected.label" type="textarea" :rows="3" placeholder="输入显示文本" @input="scheduleRedraw" @change="emitUpdate" />
            </div>
            <div class="prop-row">
              <span>字号</span>
              <el-input-number v-model="selected.fontSize" :min="12" :max="120" :step="2" size="small" @change="emitUpdate" />
            </div>
            <div class="prop-row">
              <span>文字色</span>
              <el-color-picker v-model="selected.fontColor" size="small" @change="emitUpdate" />
            </div>
            <el-button type="primary" size="small" style="width: 100%" @click="openTextEditor">弹窗编辑文本</el-button>
          </template>
          <template v-else>
            <div class="prop-row" v-if="selected.mediaName">
              <span>素材</span>
              <el-tag size="small" closable @close="clearMedia">{{ selected.mediaName }}</el-tag>
            </div>
            <el-button type="primary" size="small" style="width: 100%" @click="openMediaPicker">选择素材填充</el-button>
          </template>

          <div class="layer-actions">
            <el-button size="small" @click="bringToFront">置顶</el-button>
            <el-button size="small" @click="bringForward">上移</el-button>
            <el-button size="small" @click="sendBackward">下移</el-button>
            <el-button size="small" @click="sendToBack">置底</el-button>
          </div>
        </template>
        <el-empty v-else description="选中形状后可编辑" :image-size="56" />

        <h4 class="media-title">图层面板（上 = 顶层）</h4>
        <div class="layer-list">
          <div
            v-for="layer in layersTopFirst"
            :key="layer.id"
            class="layer-item"
            :class="{ active: selectedId === layer.id }"
            @click="selectLayer(layer.id)"
          >
            <span class="layer-name">{{ layerTitle(layer) }}</span>
            <span class="layer-type">{{ shapeLabel(layer.type) }}</span>
          </div>
          <el-empty v-if="!layersTopFirst.length" description="暂无元素" :image-size="48" />
        </div>

        <h4 class="media-title">素材库</h4>
        <div class="media-list">
          <div
            v-for="item in mediaItems"
            :key="item.id"
            class="media-chip"
            :class="{ active: pendingMediaId === item.id }"
            @click="pendingMediaId = item.id"
            @dblclick="fillWithMedia(item)"
          >
            <img v-if="item.thumbnail || item.url" :src="item.thumbnail || item.url" :alt="item.name" />
            <div class="media-meta">
              <span class="name">{{ item.name }}</span>
              <span class="type">{{ item.type }}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <el-dialog v-model="mediaDialogVisible" title="选择填充素材" width="560px">
      <el-table :data="mediaItems" highlight-current-row @current-change="onMediaSelect" height="360">
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="type" label="类型" width="90" />
        <el-table-column label="预览" width="80">
          <template #default="{ row }">
            <img v-if="row.thumbnail || row.url" :src="row.thumbnail || row.url" class="table-thumb" />
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="mediaDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!dialogMedia" @click="confirmMediaFill">确定填充</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="textDialogVisible" title="编辑文本区域" width="480px" @opened="focusTextInput">
      <el-form label-width="72px">
        <el-form-item label="文本内容">
          <el-input ref="textInputRef" v-model="textDraft" type="textarea" :rows="5" placeholder="输入要显示的文字" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="字号">
          <el-input-number v-model="textFontSize" :min="12" :max="120" :step="2" />
        </el-form-item>
        <el-form-item label="文字颜色">
          <el-color-picker v-model="textFontColor" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="textDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmTextEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import type { CanvasShape, CanvasShapeType, ProgramCanvasLayout, MediaItem } from '@/types'

const RESOLUTION_PRESETS = [
  { label: '1920×1080 (16:9)', value: '1920x1080', w: 1920, h: 1080 },
  { label: '1280×720 (16:9)', value: '1280x720', w: 1280, h: 720 },
  { label: '3840×2160 (4K)', value: '3840x2160', w: 3840, h: 2160 },
  { label: '1080×1920 (竖屏)', value: '1080x1920', w: 1080, h: 1920 },
  { label: '1366×768', value: '1366x768', w: 1366, h: 768 },
]

const props = defineProps<{
  modelValue: ProgramCanvasLayout
  mediaItems: MediaItem[]
}>()

const emit = defineEmits<{
  'update:modelValue': [ProgramCanvasLayout]
}>()

const rootRef = ref<HTMLElement>()
const canvasRef = ref<HTMLCanvasElement>()
const minimapRef = ref<HTMLCanvasElement>()
const stageRef = ref<HTMLElement>()
const textInputRef = ref<{ focus?: () => void; textarea?: HTMLTextAreaElement } | null>(null)
const tool = ref<'select' | CanvasShapeType>('select')
const selectedId = ref<string | null>(null)
const previewing = ref(false)
const mediaDialogVisible = ref(false)
const textDialogVisible = ref(false)
const pendingMediaId = ref<number | null>(null)
const dialogMedia = ref<MediaItem | null>(null)
const textDraft = ref('')
const textFontSize = ref(28)
const textFontColor = ref('#f8fafc')
const showMinimap = ref(true)
const zoom = ref(0.55)
const autoFit = ref(true)
const zoomPercent = computed({
  get: () => Math.round(zoom.value * 100),
  set: (v: number) => {
    autoFit.value = false
    zoom.value = v / 100
  },
})
const canvasCursor = ref('crosshair')
const resolutionPreset = ref('1280x720')
const customW = ref(1280)
const customH = ref(720)

const layout = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const selected = computed(() => layout.value.shapes.find((s) => s.id === selectedId.value) || null)
const layersTopFirst = computed(() => [...layout.value.shapes].reverse())
const displayWidth = computed(() => Math.round(layout.value.width * zoom.value))
const displayHeight = computed(() => Math.round(layout.value.height * zoom.value))
const aspectText = computed(() => {
  const g = gcd(layout.value.width, layout.value.height)
  return `${layout.value.width / g}:${layout.value.height / g}`
})
const minimapSize = computed(() => {
  const maxSide = 180
  const ratio = layout.value.width / layout.value.height
  if (ratio >= 1) return { w: maxSide, h: Math.round(maxSide / ratio) }
  return { w: Math.round(maxSide * ratio), h: maxSide }
})

const imageCache = new Map<string, HTMLImageElement>()
type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
const HANDLE_SIZE = 10
const MIN_SIZE = 24

let dragMode: 'none' | 'move' | 'create' | 'resize' = 'none'
let draggingId: string | null = null
let activeHandle: ResizeHandle | null = null
let startX = 0
let startY = 0
let originX = 0
let originY = 0
let originW = 0
let originH = 0
let draft: CanvasShape | null = null
let drawToken = 0
let redrawQueued = false
let viewRect = { x: 0, y: 0, w: 0, h: 0 }

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

function uid() {
  return 's_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7)
}

function shapeLabel(type: CanvasShapeType) {
  return ({ rect: '矩形', circle: '圆形', ellipse: '椭圆', triangle: '三角形', text: '文本' } as const)[type]
}

function layerTitle(layer: CanvasShape) {
  if (layer.type === 'text') return (layer.label || '未命名文本').slice(0, 16)
  if (layer.mediaName) return layer.mediaName.slice(0, 16)
  return shapeLabel(layer.type)
}

function setTool(t: CanvasShapeType) {
  tool.value = t
  selectedId.value = null
  scheduleRedraw()
}

function emitUpdate() {
  const next = {
    ...layout.value,
    resolution: `${layout.value.width}x${layout.value.height}`,
    shapes: layout.value.shapes.map((s) => {
      const copy = { ...s }
      clampShape(copy)
      return copy
    }),
  }
  emit('update:modelValue', next)
  scheduleRedraw()
}

function scheduleRedraw() {
  if (redrawQueued) return
  redrawQueued = true
  requestAnimationFrame(() => {
    redrawQueued = false
    void redraw()
  })
}

function clampShape(s: CanvasShape) {
  const W = layout.value.width
  const H = layout.value.height
  s.width = Math.min(Math.max(MIN_SIZE, s.width), W)
  s.height = Math.min(Math.max(MIN_SIZE, s.height), H)
  if (s.type === 'circle') {
    const size = Math.min(s.width, s.height, W, H)
    s.width = size
    s.height = size
  }
  s.x = Math.max(0, Math.min(s.x, W - s.width))
  s.y = Math.max(0, Math.min(s.y, H - s.height))
}

function onPropChange() {
  if (selected.value) clampShape(selected.value)
  emitUpdate()
}

function syncResolutionPreset() {
  const key = `${layout.value.width}x${layout.value.height}`
  const found = RESOLUTION_PRESETS.find((p) => p.value === key)
  if (found) {
    resolutionPreset.value = found.value
  } else {
    resolutionPreset.value = 'custom'
    customW.value = layout.value.width
    customH.value = layout.value.height
  }
}

function setResolution(w: number, h: number) {
  const oldW = layout.value.width || 1
  const oldH = layout.value.height || 1
  const sx = w / oldW
  const sy = h / oldH
  const shapes = layout.value.shapes.map((s) => {
    const next = {
      ...s,
      x: Math.round(s.x * sx),
      y: Math.round(s.y * sy),
      width: Math.round(s.width * sx),
      height: Math.round(s.height * sy),
      fontSize: s.fontSize ? Math.max(12, Math.round(s.fontSize * Math.min(sx, sy))) : s.fontSize,
    }
    next.width = Math.min(Math.max(MIN_SIZE, next.width), w)
    next.height = Math.min(Math.max(MIN_SIZE, next.height), h)
    if (next.type === 'circle') {
      const size = Math.min(next.width, next.height, w, h)
      next.width = size
      next.height = size
    }
    next.x = Math.max(0, Math.min(next.x, w - next.width))
    next.y = Math.max(0, Math.min(next.y, h - next.height))
    return next
  })
  const nextLayout: ProgramCanvasLayout = {
    ...layout.value,
    width: w,
    height: h,
    resolution: `${w}x${h}`,
    shapes,
  }
  emit('update:modelValue', nextLayout)
  nextTick(() => {
    fitZoom()
    scheduleRedraw()
  })
  ElMessage.success(`分辨率已设为 ${w}×${h}`)
}

function onResolutionPresetChange(val: string) {
  if (val === 'custom') {
    customW.value = layout.value.width
    customH.value = layout.value.height
    return
  }
  const preset = RESOLUTION_PRESETS.find((p) => p.value === val)
  if (preset) setResolution(preset.w, preset.h)
}

function applyCustomResolution() {
  setResolution(customW.value, customH.value)
  resolutionPreset.value = 'custom'
}

function zoomIn() {
  autoFit.value = false
  zoom.value = Math.min(3, Math.round((zoom.value + 0.1) * 100) / 100)
}
function zoomOut() {
  autoFit.value = false
  zoom.value = Math.max(0.25, Math.round((zoom.value - 0.1) * 100) / 100)
}
function onZoomSlider(v: number | number[]) {
  autoFit.value = false
  zoom.value = (Array.isArray(v) ? v[0] : v) / 100
}
function fitZoom() {
  const stage = stageRef.value
  if (!stage) return
  const pad = 40
  const availW = Math.max(160, stage.clientWidth - pad)
  const availH = Math.max(160, stage.clientHeight - pad)
  if (availW < 50 || availH < 50) return
  // 完整落入可视区域，可随窗口放大到超过 100% 以便大屏利用空间
  const z = Math.min(availW / layout.value.width, availH / layout.value.height)
  zoom.value = Math.max(0.15, Math.min(3, Math.round(z * 100) / 100))
  autoFit.value = true
  nextTick(() => {
    updateViewRect()
    drawMinimap()
  })
}

function handleContainerResize() {
  if (autoFit.value) fitZoom()
  else {
    updateViewRect()
    drawMinimap()
  }
}

function onWheel(e: WheelEvent) {
  if (!e.ctrlKey && !e.metaKey) return
  autoFit.value = false
  if (e.deltaY < 0) zoomIn()
  else zoomOut()
}

function getPointer(e: MouseEvent) {
  const canvas = canvasRef.value!
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  }
}

function pointInShape(s: CanvasShape, x: number, y: number): boolean {
  if (x < s.x || x > s.x + s.width || y < s.y || y > s.y + s.height) return false
  if (s.type === 'rect' || s.type === 'text') return true
  if (s.type === 'circle' || s.type === 'ellipse') {
    const cx = s.x + s.width / 2
    const cy = s.y + s.height / 2
    const rx = s.width / 2
    const ry = s.height / 2
    return ((x - cx) * (x - cx)) / (rx * rx) + ((y - cy) * (y - cy)) / (ry * ry) <= 1
  }
  if (s.type === 'triangle') {
    const x1 = s.x + s.width / 2
    const y1 = s.y
    const x2 = s.x + s.width
    const y2 = s.y + s.height
    const x3 = s.x
    const y3 = s.y + s.height
    const area = (a: number, b: number, c: number, d: number, e: number, f: number) =>
      Math.abs((a * (d - f) + c * (f - b) + e * (b - d)) / 2)
    const A = area(x1, y1, x2, y2, x3, y3)
    const A1 = area(x, y, x2, y2, x3, y3)
    const A2 = area(x1, y1, x, y, x3, y3)
    const A3 = area(x1, y1, x2, y2, x, y)
    return Math.abs(A - (A1 + A2 + A3)) < 0.5
  }
  return true
}

function hitTest(x: number, y: number): CanvasShape | null {
  const shapes = layout.value.shapes
  for (let i = shapes.length - 1; i >= 0; i--) {
    if (pointInShape(shapes[i], x, y)) return shapes[i]
  }
  return null
}

function createShape(type: CanvasShapeType, x: number, y: number, w = 160, h = 120): CanvasShape {
  if (type === 'text') {
    return {
      id: uid(),
      type: 'text',
      x,
      y,
      width: Math.max(w, 220),
      height: Math.max(h, 80),
      fill: '#0f172acc',
      stroke: '#2dd4bf',
      label: '双击编辑文本',
      fontSize: 28,
      fontColor: '#f8fafc',
    }
  }
  return {
    id: uid(),
    type,
    x,
    y,
    width: w,
    height: type === 'circle' ? w : h,
    fill: '#0d948833',
    stroke: '#0d9488',
    label: '',
  }
}

function addShapeAtCenter(type: CanvasShapeType) {
  const w = type === 'text' ? 280 : 160
  const h = type === 'text' ? 96 : 120
  const shape = createShape(type, layout.value.width / 2 - w / 2, layout.value.height / 2 - h / 2, w, h)
  clampShape(shape)
  layout.value.shapes.push(shape)
  selectedId.value = shape.id
  tool.value = 'select'
  emitUpdate()
  ElMessage.success(`已添加${shapeLabel(type)}`)
  if (type === 'text') openTextEditor()
}

function findShapeById(id: string | null) {
  if (!id) return null
  return layout.value.shapes.find((s) => s.id === id) || null
}

function getHandlePoints(s: CanvasShape): Record<ResizeHandle, { x: number; y: number }> {
  const { x, y, width: w, height: h } = s
  return {
    nw: { x, y },
    n: { x: x + w / 2, y },
    ne: { x: x + w, y },
    e: { x: x + w, y: y + h / 2 },
    se: { x: x + w, y: y + h },
    s: { x: x + w / 2, y: y + h },
    sw: { x, y: y + h },
    w: { x, y: y + h / 2 },
  }
}

function hitResizeHandle(s: CanvasShape, x: number, y: number): ResizeHandle | null {
  const points = getHandlePoints(s)
  const hitPad = HANDLE_SIZE / zoom.value
  for (const [name, p] of Object.entries(points) as [ResizeHandle, { x: number; y: number }][]) {
    if (Math.abs(x - p.x) <= hitPad && Math.abs(y - p.y) <= hitPad) return name
  }
  return null
}

function cursorForHandle(handle: ResizeHandle | null): string {
  if (!handle) return 'default'
  return (
    {
      nw: 'nwse-resize',
      se: 'nwse-resize',
      ne: 'nesw-resize',
      sw: 'nesw-resize',
      n: 'ns-resize',
      s: 'ns-resize',
      e: 'ew-resize',
      w: 'ew-resize',
    } as const
  )[handle]
}

function applyResize(target: CanvasShape, handle: ResizeHandle, x: number, y: number) {
  const right = originX + originW
  const bottom = originY + originH
  let newX = originX
  let newY = originY
  let newW = originW
  let newH = originH

  if (handle.includes('e')) newW = Math.max(MIN_SIZE, x - originX)
  if (handle.includes('s')) newH = Math.max(MIN_SIZE, y - originY)
  if (handle.includes('w')) {
    newX = Math.min(x, right - MIN_SIZE)
    newW = right - newX
  }
  if (handle.includes('n')) {
    newY = Math.min(y, bottom - MIN_SIZE)
    newH = bottom - newY
  }

  if (target.type === 'circle') {
    const size = Math.max(MIN_SIZE, Math.min(newW, newH))
    if (handle.includes('w')) newX = right - size
    if (handle.includes('n')) newY = bottom - size
    if (handle === 'n' || handle === 's') newX = originX + (originW - size) / 2
    if (handle === 'e' || handle === 'w') newY = originY + (originH - size) / 2
    newW = size
    newH = size
  }

  target.x = Math.round(newX)
  target.y = Math.round(newY)
  target.width = Math.round(newW)
  target.height = Math.round(newH)
  clampShape(target)
}

function drawResizeHandles(ctx: CanvasRenderingContext2D, s: CanvasShape) {
  const points = getHandlePoints(s)
  const hs = HANDLE_SIZE / Math.max(zoom.value, 0.4)
  ctx.save()
  ctx.strokeStyle = '#fbbf24'
  ctx.setLineDash([6, 4])
  ctx.lineWidth = 1 / Math.max(zoom.value, 0.4)
  ctx.strokeRect(s.x - 4, s.y - 4, s.width + 8, s.height + 8)
  ctx.setLineDash([])
  for (const p of Object.values(points)) {
    ctx.fillStyle = '#fff'
    ctx.strokeStyle = '#0f766e'
    ctx.lineWidth = 1.5 / Math.max(zoom.value, 0.4)
    ctx.beginPath()
    ctx.rect(p.x - hs / 2, p.y - hs / 2, hs, hs)
    ctx.fill()
    ctx.stroke()
  }
  ctx.restore()
}

function onMouseDown(e: MouseEvent) {
  if (previewing.value) return
  e.preventDefault()
  const { x, y } = getPointer(e)
  startX = x
  startY = y

  if (tool.value === 'select') {
    const current = findShapeById(selectedId.value)
    if (current) {
      const handle = hitResizeHandle(current, x, y)
      if (handle) {
        draggingId = current.id
        activeHandle = handle
        dragMode = 'resize'
        originX = current.x
        originY = current.y
        originW = current.width
        originH = current.height
        canvasCursor.value = cursorForHandle(handle)
        scheduleRedraw()
        return
      }
    }

    const hit = hitTest(x, y)
    selectedId.value = hit?.id || null
    if (hit) {
      draggingId = hit.id
      dragMode = 'move'
      activeHandle = null
      originX = hit.x
      originY = hit.y
      originW = hit.width
      originH = hit.height
      canvasCursor.value = 'move'
      if (pendingMediaId.value && hit.type !== 'text') {
        const media = props.mediaItems.find((m) => m.id === pendingMediaId.value)
        if (media) fillWithMedia(media)
      }
    } else {
      draggingId = null
      dragMode = 'none'
      activeHandle = null
      canvasCursor.value = 'default'
    }
    scheduleRedraw()
    return
  }

  draft = createShape(tool.value, x, y, 1, 1)
  dragMode = 'create'
  draggingId = null
  activeHandle = null
  canvasCursor.value = 'crosshair'
  scheduleRedraw()
}

function onMouseMove(e: MouseEvent) {
  if (previewing.value) return
  const { x, y } = getPointer(e)

  if (dragMode === 'resize' && draggingId && activeHandle) {
    const target = findShapeById(draggingId)
    if (!target) return
    applyResize(target, activeHandle, x, y)
    scheduleRedraw()
    return
  }

  if (dragMode === 'move' && draggingId) {
    const target = findShapeById(draggingId)
    if (!target) return
    target.x = Math.round(originX + (x - startX))
    target.y = Math.round(originY + (y - startY))
    clampShape(target)
    scheduleRedraw()
    return
  }

  if (dragMode === 'create' && draft) {
    const w = Math.max(MIN_SIZE, Math.abs(x - startX))
    const h = Math.max(MIN_SIZE, Math.abs(y - startY))
    draft.x = Math.min(startX, x)
    draft.y = Math.min(startY, y)
    if (draft.type === 'circle') {
      const size = Math.min(w, h)
      draft.width = size
      draft.height = size
    } else if (draft.type === 'text') {
      draft.width = Math.max(120, w)
      draft.height = Math.max(48, h)
    } else {
      draft.width = w
      draft.height = h
    }
    clampShape(draft)
    scheduleRedraw()
    return
  }

  if (tool.value === 'select') {
    const current = findShapeById(selectedId.value)
    if (current) {
      const handle = hitResizeHandle(current, x, y)
      if (handle) {
        canvasCursor.value = cursorForHandle(handle)
        return
      }
    }
    const hit = hitTest(x, y)
    canvasCursor.value = hit ? 'move' : 'default'
  } else {
    canvasCursor.value = 'crosshair'
  }
}

function onMouseUp() {
  if (dragMode === 'create' && draft && draft.width >= MIN_SIZE && draft.height >= MIN_SIZE) {
    clampShape(draft)
    const created = { ...draft }
    layout.value.shapes.push(created)
    selectedId.value = created.id
    tool.value = 'select'
    emitUpdate()
    if (created.type === 'text') openTextEditor()
  } else if ((dragMode === 'move' || dragMode === 'resize') && draggingId) {
    const target = findShapeById(draggingId)
    if (target) clampShape(target)
    emitUpdate()
  }
  draft = null
  dragMode = 'none'
  draggingId = null
  activeHandle = null
  scheduleRedraw()
}

function onDblClick(e: MouseEvent) {
  if (previewing.value) return
  const { x, y } = getPointer(e)
  const hit = hitTest(x, y)
  if (!hit) return
  selectedId.value = hit.id
  if (hit.type === 'text') openTextEditor()
  else openMediaPicker()
}

function selectLayer(id: string) {
  selectedId.value = id
  tool.value = 'select'
  scheduleRedraw()
}

function reorderSelected(mutate: (arr: CanvasShape[], index: number) => void) {
  if (!selectedId.value) return
  const arr = [...layout.value.shapes]
  const index = arr.findIndex((s) => s.id === selectedId.value)
  if (index < 0) return
  mutate(arr, index)
  layout.value.shapes = arr
  emitUpdate()
}

function bringToFront() {
  reorderSelected((arr, index) => {
    const [item] = arr.splice(index, 1)
    arr.push(item)
  })
}
function sendToBack() {
  reorderSelected((arr, index) => {
    const [item] = arr.splice(index, 1)
    arr.unshift(item)
  })
}
function bringForward() {
  reorderSelected((arr, index) => {
    if (index >= arr.length - 1) return
    ;[arr[index], arr[index + 1]] = [arr[index + 1], arr[index]]
  })
}
function sendBackward() {
  reorderSelected((arr, index) => {
    if (index <= 0) return
    ;[arr[index], arr[index - 1]] = [arr[index - 1], arr[index]]
  })
}

function removeSelected() {
  if (!selectedId.value) return
  layout.value.shapes = layout.value.shapes.filter((s) => s.id !== selectedId.value)
  selectedId.value = null
  emitUpdate()
}

function clearMedia() {
  if (!selected.value) return
  selected.value.mediaId = undefined
  selected.value.mediaUrl = undefined
  selected.value.mediaName = undefined
  emitUpdate()
}

function fillWithMedia(item: MediaItem) {
  const target = selected.value
  if (!target) {
    ElMessage.warning('请先选中一个形状')
    return
  }
  if (target.type === 'text') {
    ElMessage.warning('文本框请直接编辑文字，无需填充素材')
    return
  }
  target.mediaId = item.id
  target.mediaUrl = item.url || item.thumbnail
  target.mediaName = item.name
  pendingMediaId.value = null
  emitUpdate()
  ElMessage.success(`已填充素材：${item.name}`)
}

function openMediaPicker() {
  if (!selected.value) {
    ElMessage.warning('请先选中一个形状')
    return
  }
  if (selected.value.type === 'text') {
    openTextEditor()
    return
  }
  mediaDialogVisible.value = true
}

function openTextEditor() {
  const target = selected.value
  if (!target || target.type !== 'text') {
    ElMessage.warning('请先选中文本区域')
    return
  }
  textDraft.value = target.label || ''
  textFontSize.value = target.fontSize || 28
  textFontColor.value = target.fontColor || '#f8fafc'
  textDialogVisible.value = true
}

function focusTextInput() {
  nextTick(() => {
    textInputRef.value?.focus?.()
    textInputRef.value?.textarea?.focus()
  })
}

function confirmTextEdit() {
  const target = selected.value
  if (!target || target.type !== 'text') return
  target.label = textDraft.value.trim() || '文本'
  target.fontSize = textFontSize.value
  target.fontColor = textFontColor.value
  textDialogVisible.value = false
  emitUpdate()
  ElMessage.success('文本已更新')
}

function onMediaSelect(row: MediaItem | null) {
  dialogMedia.value = row
}

function confirmMediaFill() {
  if (dialogMedia.value) {
    fillWithMedia(dialogMedia.value)
    mediaDialogVisible.value = false
  }
}

function togglePreview() {
  previewing.value = !previewing.value
  selectedId.value = null
  scheduleRedraw()
}

function onKeydown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return
  const key = e.key.toLowerCase()
  if (key === 'v') tool.value = 'select'
  else if (key === 'r') addShapeAtCenter('rect')
  else if (key === 'c') addShapeAtCenter('circle')
  else if (key === 'o') addShapeAtCenter('ellipse')
  else if (key === 't') addShapeAtCenter('triangle')
  else if (key === 'x') addShapeAtCenter('text')
  else if (key === 'p') togglePreview()
  else if (key === '=' || key === '+') zoomIn()
  else if (key === '-') zoomOut()
  else if (key === ']' || (e.ctrlKey && key === 'arrowup')) {
    e.preventDefault()
    if (e.shiftKey) bringToFront()
    else bringForward()
  } else if (key === '[' || (e.ctrlKey && key === 'arrowdown')) {
    e.preventDefault()
    if (e.shiftKey) sendToBack()
    else sendBackward()
  } else if (key === 'delete' || key === 'backspace') {
    e.preventDefault()
    removeSelected()
  } else if (e.ctrlKey && key === 'd' && selected.value) {
    e.preventDefault()
    const copy = { ...selected.value, id: uid(), x: selected.value.x + 20, y: selected.value.y + 20 }
    clampShape(copy)
    layout.value.shapes.push(copy)
    selectedId.value = copy.id
    emitUpdate()
  }
}

function loadImage(url: string): Promise<HTMLImageElement | null> {
  if (!url) return Promise.resolve(null)
  if (imageCache.has(url)) return Promise.resolve(imageCache.get(url)!)
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imageCache.set(url, img)
      resolve(img)
    }
    img.onerror = () => resolve(null)
    img.src = url
  })
}

function drawShapePath(ctx: CanvasRenderingContext2D, s: CanvasShape) {
  const { x, y, width: w, height: h, type } = s
  ctx.beginPath()
  if (type === 'rect' || type === 'text') ctx.rect(x, y, w, h)
  else if (type === 'circle') {
    const r = Math.min(w, h) / 2
    ctx.arc(x + w / 2, y + h / 2, r, 0, Math.PI * 2)
  } else if (type === 'ellipse') {
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2)
  } else if (type === 'triangle') {
    ctx.moveTo(x + w / 2, y)
    ctx.lineTo(x + w, y + h)
    ctx.lineTo(x, y + h)
    ctx.closePath()
  }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = []
  for (const paragraph of (text || '').split('\n')) {
    if (!paragraph) {
      lines.push('')
      continue
    }
    let line = ''
    for (const ch of paragraph) {
      const test = line + ch
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line)
        line = ch
      } else line = test
    }
    if (line) lines.push(line)
  }
  return lines
}

function updateViewRect() {
  const stage = stageRef.value
  if (!stage) return
  const scale = zoom.value || 1
  viewRect = {
    x: stage.scrollLeft / scale,
    y: stage.scrollTop / scale,
    w: stage.clientWidth / scale,
    h: stage.clientHeight / scale,
  }
}

function onStageScroll() {
  updateViewRect()
  drawMinimap()
}

function onMinimapDown(e: MouseEvent) {
  const mm = minimapRef.value
  const stage = stageRef.value
  if (!mm || !stage) return
  const rect = mm.getBoundingClientRect()
  const mx = ((e.clientX - rect.left) / rect.width) * layout.value.width
  const my = ((e.clientY - rect.top) / rect.height) * layout.value.height
  const scale = zoom.value || 1
  stage.scrollLeft = Math.max(0, mx * scale - stage.clientWidth / 2)
  stage.scrollTop = Math.max(0, my * scale - stage.clientHeight / 2)
  updateViewRect()
  drawMinimap()
}

function drawMinimap() {
  const mm = minimapRef.value
  if (!mm || !showMinimap.value) return
  const ctx = mm.getContext('2d')
  if (!ctx) return
  const { w, h } = minimapSize.value
  const sx = w / layout.value.width
  const sy = h / layout.value.height

  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = layout.value.background || '#0b1220'
  ctx.fillRect(0, 0, w, h)

  for (const s of layout.value.shapes) {
    ctx.fillStyle = s.mediaUrl ? '#14b8a6aa' : s.fill || '#334155'
    ctx.fillRect(s.x * sx, s.y * sy, Math.max(2, s.width * sx), Math.max(2, s.height * sy))
    if (selectedId.value === s.id) {
      ctx.strokeStyle = '#fbbf24'
      ctx.lineWidth = 1.5
      ctx.strokeRect(s.x * sx, s.y * sy, Math.max(2, s.width * sx), Math.max(2, s.height * sy))
    }
  }

  updateViewRect()
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 2
  ctx.strokeRect(
    viewRect.x * sx,
    viewRect.y * sy,
    Math.min(w, viewRect.w * sx),
    Math.min(h, viewRect.h * sy)
  )
}

async function redraw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const token = ++drawToken
  const shapes = [...layout.value.shapes]
  if (draft) shapes.push(draft)

  const urls = [...new Set(shapes.map((s) => s.mediaUrl).filter(Boolean))] as string[]
  await Promise.all(urls.map((url) => loadImage(url)))
  if (token !== drawToken) return

  ctx.save()
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = layout.value.background || '#0b1220'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  if (!previewing.value) {
    ctx.strokeStyle = 'rgba(148,163,184,0.12)'
    ctx.lineWidth = 1
    for (let gx = 0; gx < canvas.width; gx += 40) {
      ctx.beginPath()
      ctx.moveTo(gx, 0)
      ctx.lineTo(gx, canvas.height)
      ctx.stroke()
    }
    for (let gy = 0; gy < canvas.height; gy += 40) {
      ctx.beginPath()
      ctx.moveTo(0, gy)
      ctx.lineTo(canvas.width, gy)
      ctx.stroke()
    }
  }

  for (const s of shapes) {
    drawShapePath(ctx, s)
    ctx.save()
    ctx.clip()

    if (s.type === 'text') {
      ctx.fillStyle = s.fill || '#0f172acc'
      ctx.fillRect(s.x, s.y, s.width, s.height)
      const fontSize = s.fontSize || 28
      ctx.fillStyle = s.fontColor || '#f8fafc'
      ctx.font = `${fontSize}px "Source Sans 3", "IBM Plex Sans", sans-serif`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      const pad = 12
      const lines = wrapText(ctx, s.label || '文本', Math.max(20, s.width - pad * 2))
      const lineHeight = fontSize * 1.35
      lines.forEach((line, i) => {
        const ty = s.y + pad + i * lineHeight
        if (ty + lineHeight > s.y + s.height - 4) return
        ctx.fillText(line, s.x + pad, ty)
      })
    } else if (s.mediaUrl) {
      const img = imageCache.get(s.mediaUrl)
      if (img) {
        const scale = Math.max(s.width / img.width, s.height / img.height)
        const dw = img.width * scale
        const dh = img.height * scale
        ctx.drawImage(img, s.x + (s.width - dw) / 2, s.y + (s.height - dh) / 2, dw, dh)
      } else {
        ctx.fillStyle = s.fill
        ctx.fill()
      }
    } else {
      ctx.fillStyle = s.fill
      ctx.fill()
      if (!previewing.value) {
        ctx.fillStyle = 'rgba(248,250,252,0.75)'
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('点击填充素材', s.x + s.width / 2, s.y + s.height / 2)
      }
    }
    ctx.restore()

    drawShapePath(ctx, s)
    ctx.strokeStyle = s.stroke
    ctx.lineWidth = selectedId.value === s.id && !previewing.value ? 3 : 1.5
    ctx.stroke()

    if (selectedId.value === s.id && !previewing.value) drawResizeHandles(ctx, s)
  }
  ctx.restore()
  drawMinimap()
}

watch(() => props.modelValue, () => {
  syncResolutionPreset()
  scheduleRedraw()
}, { deep: true })
watch(() => props.mediaItems, () => scheduleRedraw(), { deep: true })
watch([zoom, showMinimap, displayWidth, displayHeight], () => {
  nextTick(() => {
    updateViewRect()
    drawMinimap()
  })
})

let stageObserver: ResizeObserver | null = null

onMounted(() => {
  if (!layout.value.resolution) {
    emit('update:modelValue', {
      ...layout.value,
      resolution: `${layout.value.width}x${layout.value.height}`,
    })
  }
  syncResolutionPreset()
  nextTick(() => {
    fitZoom()
    scheduleRedraw()
    if (stageRef.value && typeof ResizeObserver !== 'undefined') {
      stageObserver = new ResizeObserver(() => {
        handleContainerResize()
      })
      stageObserver.observe(stageRef.value)
    }
  })
  rootRef.value?.focus()
  window.addEventListener('resize', handleContainerResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleContainerResize)
  stageObserver?.disconnect()
  stageObserver = null
})

defineExpose({ addShapeAtCenter, togglePreview, redraw, setResolution, fitZoom })
</script>

<style scoped>
.program-canvas {
  outline: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  min-height: 0;
}
.canvas-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.canvas-toolbar.secondary {
  padding-top: 2px;
}
.tool-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}
.toolbar-label {
  font-size: 12px;
  color: var(--text-secondary);
}
.zoom-text {
  font-size: 12px;
  min-width: 42px;
  color: var(--text-regular);
}
.shortcut-hint {
  font-size: 12px;
  color: var(--text-secondary);
  margin-left: auto;
}
.canvas-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 16px;
  flex: 1;
  min-height: 0;
}
.canvas-workspace.previewing {
  grid-template-columns: 1fr;
}
.canvas-stage {
  position: relative;
  background: var(--surface-muted);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: auto;
  min-height: 0;
  height: 100%;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.canvas-frame {
  margin: 0 auto;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.25);
  background: #000;
  flex-shrink: 0;
}
canvas {
  display: block;
  max-width: none;
}
.minimap {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 5;
  background: color-mix(in srgb, var(--surface-elevated) 94%, transparent);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(8px);
}
.minimap-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12px;
  color: var(--text-regular);
}
.minimap-canvas {
  display: block;
  border-radius: 4px;
  cursor: crosshair;
  border: 1px solid var(--border-color);
}
.minimap-tip {
  margin: 4px 0 0;
  font-size: 11px;
  color: var(--text-secondary);
}
.property-panel {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 14px;
  background: var(--surface-elevated);
  overflow: auto;
  min-height: 0;
  height: 100%;
}
.property-panel h4 {
  margin: 0 0 12px;
  font-size: 14px;
}
.prop-row {
  display: grid;
  grid-template-columns: 56px 1fr;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 12px;
  color: var(--text-secondary);
}
.prop-row-block {
  grid-template-columns: 1fr;
  align-items: stretch;
}
.layer-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin: 12px 0 4px;
}
.media-title {
  margin-top: 18px;
}
.layer-list,
.media-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 160px;
  overflow: auto;
}
.layer-item {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  font-size: 12px;
}
.layer-item.active,
.layer-item:hover {
  border-color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 12%, transparent);
}
.layer-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.layer-type {
  color: var(--text-secondary);
  flex-shrink: 0;
}
.media-chip {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 6px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
}
.media-chip:hover,
.media-chip.active {
  border-color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 12%, transparent);
}
.media-chip img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
  background: #111;
}
.media-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.media-meta .name {
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.media-meta .type {
  font-size: 11px;
  color: var(--text-secondary);
}
.table-thumb {
  width: 36px;
  height: 36px;
  object-fit: cover;
  border-radius: 4px;
}
@media (max-width: 960px) {
  .canvas-workspace {
    grid-template-columns: 1fr;
    min-height: 480px;
  }
  .canvas-stage {
    min-height: 420px;
    height: 50vh;
  }
  .property-panel {
    height: auto;
    max-height: 420px;
  }
}
</style>
