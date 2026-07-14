<template>
  <div class="page-card program-editor-page">
    <div class="editor-header">
      <h2>{{ isEdit ? '编辑节目' : '新建节目' }}</h2>
      <div class="header-actions">
        <el-button @click="$router.back()">取消</el-button>
        <el-button type="primary" @click="handleSave('draft')">保存草稿</el-button>
        <el-button type="success" @click="handleSave('pending')">提交审核</el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="editor-tabs">
      <!-- Basic Info Tab -->
      <el-tab-pane label="基本信息" name="basic">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" class="editor-form">
          <el-form-item label="节目名称" prop="title">
            <el-input v-model="form.title" placeholder="请输入节目名称" maxlength="100" />
          </el-form-item>
          <el-form-item label="简介" prop="description">
            <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入节目简介" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :xs="24" :sm="8">
              <el-form-item label="分类">
                <el-select v-model="form.categoryId" placeholder="选择分类" style="width: 100%">
                  <el-option label="纪录片" :value="1" /><el-option label="综艺" :value="2" /><el-option label="新闻" :value="3" /><el-option label="电视剧" :value="4" /><el-option label="动画" :value="5" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="8">
              <el-form-item label="主创人员">
                <el-input v-model="creatorsInput" placeholder="输入后回车添加" @keyup.enter="addCreator" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="8">
              <el-form-item label="版权信息">
                <el-input v-model="form.copyright" placeholder="版权信息" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="封面图">
            <el-upload class="cover-uploader" action="#" :auto-upload="false" :show-file-list="false" @change="handleCoverChange">
              <img v-if="form.coverImage" :src="form.coverImage" class="cover-preview" />
              <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>
          <el-form-item label="标签">
            <el-tag v-for="tag in form.tags" :key="tag" closable style="margin-right: 6px" @close="removeTag(tag)">{{ tag }}</el-tag>
            <el-input v-if="inputVisible" v-model="inputValue" ref="inputRef" size="small" style="width: 100px" @blur="handleInputConfirm" @keyup.enter="handleInputConfirm" />
            <el-button v-else size="small" @click="showInput">+ 添加</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- Chapters Tab -->
      <el-tab-pane label="章节管理" name="chapters">
        <div class="chapters-toolbar">
          <el-button type="primary" size="small" @click="addChapter"><el-icon><Plus /></el-icon> 添加章节</el-button>
        </div>
        <draggable v-model="form.chapters" item-key="id" class="chapters-list" ghost-class="ghost" animation="200">
          <template #item="{ element: chapter, index }">
            <div class="chapter-item">
              <div class="chapter-drag-handle"><el-icon><Rank /></el-icon></div>
              <div class="chapter-content">
                <el-input v-model="chapter.title" placeholder="章节标题" style="flex: 1" />
                <el-input-number v-model="chapter.duration" :min="0" :step="60" size="small" style="width: 150px; margin: 0 12px" placeholder="时长(秒)" />
              </div>
              <div class="chapter-actions">
                <el-button link type="primary" size="small">编辑内容</el-button>
                <el-button link type="danger" size="small" @click="removeChapter(index)">删除</el-button>
              </div>
            </div>
          </template>
        </draggable>
      </el-tab-pane>

      <!-- Assets Tab -->
      <el-tab-pane label="关联素材" name="assets">
        <div class="assets-toolbar">
          <el-button type="primary" size="small" @click="assetDialogVisible = true"><el-icon><Plus /></el-icon> 关联素材</el-button>
        </div>
        <div class="assets-grid" v-if="form.assets?.length">
          <div v-for="asset in form.assets" :key="asset.id" class="asset-item">
            <div class="asset-type-badge">{{ asset.type }}</div>
            <div class="asset-media-name">素材 #{{ asset.mediaId }}</div>
            <div class="asset-actions">
              <el-button link type="primary" size="small" @click="setCover(asset.id)" v-if="!asset.isCover">设为封面</el-button>
              <el-button link type="danger" size="small" @click="removeAsset(asset.id)">移除</el-button>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无关联素材" />
      </el-tab-pane>

      <!-- Timeline Tab -->
      <el-tab-pane label="时间线" name="timeline">
        <div class="timeline-toolbar">
          <el-button type="primary" size="small" @click="addTimelineMarker"><el-icon><Plus /></el-icon> 添加标记</el-button>
        </div>
        <el-timeline v-if="timelineMarkers.length">
          <el-timeline-item
            v-for="marker in timelineMarkers"
            :key="marker.id"
            :timestamp="formatDuration(marker.time)"
            placement="top"
            :type="marker.type"
          >
            <el-card shadow="never">
              <div class="marker-content">
                <span>{{ marker.label }}</span>
                <el-button link type="danger" size="small" @click="removeMarker(marker.id)">删除</el-button>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else description="暂无时间线标记" />
      </el-tab-pane>
    </el-tabs>

    <!-- Asset Selection Dialog -->
    <el-dialog v-model="assetDialogVisible" title="选择素材" width="600px">
      <el-table :data="availableAssets" @selection-change="handleAssetSelection" style="width: 100%">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="name" label="文件名" />
        <el-table-column prop="type" label="类型" width="80" />
        <el-table-column prop="size" label="大小" width="100">
          <template #default="{ row }">{{ (row.size / 1024 / 1024).toFixed(1) }}MB</template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="assetDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAssetAssociation">确定关联</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Rank } from '@element-plus/icons-vue'
import draggable from 'vuedraggable'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => !!route.params.id)
const formRef = ref()
const activeTab = ref('basic')
const inputVisible = ref(false)
const inputValue = ref('')
const inputRef = ref()
const assetDialogVisible = ref(false)
const selectedAssets = ref<any[]>([])

const form = reactive({
  title: '', description: '', coverImage: '', categoryId: 1,
  tags: [] as string[], creators: [] as string[], copyright: '© 2024 CMS',
  chapters: [] as any[], assets: [] as any[],
})

const creatorsInput = ref('')
const timelineMarkers = ref([
  { id: 1, time: 0, label: '开场', type: 'primary' },
  { id: 2, time: 300, label: '主要内容开始', type: 'success' },
  { id: 3, time: 1200, label: '高潮部分', type: 'warning' },
  { id: 4, time: 1740, label: '结尾', type: 'info' },
])

const availableAssets = ref([
  { id: 1, name: '预告片.mp4', type: '视频', size: 52428800 },
  { id: 2, name: '海报.jpg', type: '图片', size: 2097152 },
  { id: 3, name: '配乐.mp3', type: '音频', size: 8388608 },
])

const rules = {
  title: [{ required: true, message: '请输入节目名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入简介', trigger: 'blur' }],
}

function removeTag(tag: string) { form.tags = form.tags.filter((t) => t !== tag) }
function showInput() { inputVisible.value = true; setTimeout(() => inputRef.value?.input?.focus(), 200) }
function handleInputConfirm() { if (inputValue.value && !form.tags.includes(inputValue.value)) form.tags.push(inputValue.value); inputVisible.value = false; inputValue.value = '' }
function handleCoverChange(file: any) { const reader = new FileReader(); reader.onload = (e) => { form.coverImage = e.target?.result as string }; reader.readAsDataURL(file.raw) }
function addCreator() { if (creatorsInput.value.trim()) { form.creators.push(creatorsInput.value.trim()); creatorsInput.value = '' } }
function removeChapter(index: number) { form.chapters.splice(index, 1) }
function addChapter() { form.chapters.push({ title: `新章节 ${form.chapters.length + 1}`, duration: 1800, sortOrder: form.chapters.length }) }
function handleAssetSelection(rows: any[]) { selectedAssets.value = rows }
function confirmAssetAssociation() {
  selectedAssets.value.forEach(a => form.assets.push({ id: Date.now() + Math.random(), mediaId: a.id, type: 'attachment', isCover: false }))
  assetDialogVisible.value = false
  selectedAssets.value = []
}
function setCover(_assetId: number) { ElMessage.success('已设为封面') }
function removeAsset(_id: number) { ElMessage.success('已移除') }
function addTimelineMarker() { ElMessage.info('请在播放器中定位时间点添加标记') }
function removeMarker(_id: number) { ElMessage.success('标记已删除') }
function formatDuration(seconds: number) { const m = Math.floor(seconds / 60); const s = seconds % 60; return `${m}分${s}秒` }

async function handleSave(status: string) {
  try {
    await formRef.value?.validate()
    ElMessage.success(isEdit.value ? '保存成功' : '创建成功')
    router.push('/programs')
  } catch { /* ignored */ }
}

onMounted(() => {
  if (isEdit.value) {
    form.title = `节目名称 ${route.params.id}`
    form.description = `这是第 ${route.params.id} 个节目的描述`
    form.chapters = [{ title: '第1集', duration: 1800, sortOrder: 0 }]
  }
})
</script>

<style scoped>
.program-editor-page { padding: 24px; }
.editor-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color); }
.editor-header h2 { margin: 0; font-size: 20px; }
.header-actions { display: flex; gap: 8px; }
.editor-form { max-width: 800px; }
.cover-uploader :deep(.el-upload) { border: 1px dashed #d9d9d9; border-radius: 6px; cursor: pointer; overflow: hidden; }
.cover-uploader-icon { font-size: 28px; color: #8c939d; width: 178px; height: 150px; display: flex; align-items: center; justify-content: center; background: #fafafa; }
.cover-preview { width: 178px; height: 150px; object-fit: cover; }
.chapters-toolbar, .assets-toolbar, .timeline-toolbar { margin-bottom: 12px; }
.chapters-list { display: flex; flex-direction: column; gap: 8px; }
.chapter-item { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid var(--border-color); border-radius: 6px; }
.chapter-drag-handle { cursor: grab; color: #999; padding: 4px; }
.chapter-content { flex: 1; display: flex; align-items: center; gap: 12px; }
.chapter-actions { display: flex; gap: 4px; }
.assets-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px; }
.asset-item { padding: 12px; border: 1px solid var(--border-color); border-radius: 6px; display: flex; flex-direction: column; gap: 8px; }
.asset-type-badge { font-size: 12px; padding: 2px 8px; border-radius: 4px; background: #ecf5ff; color: #409eff; align-self: flex-start; }
.marker-content { display: flex; justify-content: space-between; align-items: center; }
</style>

