<template>
  <div class="page-card">
    <div class="page-toolbar">
      <div class="toolbar-left">
        <el-input v-model="searchQuery" placeholder="搜索标题/作者" clearable style="width: 220px">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 130px">
          <el-option label="草稿" value="draft" />
          <el-option label="待审核" value="pending" />
          <el-option label="已发布" value="published" />
          <el-option label="已归档" value="archived" />
        </el-select>
        <el-button type="primary" @click="fetchData"><el-icon><Search /></el-icon> 搜索</el-button>
      </div>
      <div>
        <el-button type="primary" @click="$router.push('/programs/create')">
          <el-icon><Plus /></el-icon> 新建节目
        </el-button>
      </div>
    </div>

    <div class="table-wrapper">
      <el-table :data="tableData" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="title" label="节目名称" min-width="180">
          <template #default="{ row }">
            <div class="program-title-cell">
              <div class="program-cover" v-if="row.coverImage">
                <img :src="row.coverImage" />
              </div>
              <div class="program-cover-placeholder" v-else>
                <el-icon :size="24"><VideoCamera /></el-icon>
              </div>
              <div class="program-info">
                <div class="program-name">{{ row.title }}</div>
                <div class="program-desc">{{ row.description }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column label="章节" width="80">
          <template #default="{ row }">{{ row.chapters?.length || 0 }} 集</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" effect="dark" size="small">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="version" label="版本" width="80" />
        <el-table-column prop="updatedAt" label="更新时间" width="170" />
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="$router.push(`/programs/${row.id}/edit`)">编辑</el-button>
            <el-button link type="success" @click="handlePreview(row)">预览</el-button>
            <el-button link type="warning" @click="handleHistory(row)">历史</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next"
      />
    </div>

    <!-- History Dialog -->
    <el-dialog v-model="historyDialogVisible" :title="'版本历史 - ' + currentProgram?.title" width="700px">
      <el-timeline v-if="currentProgram?.history?.length">
        <el-timeline-item
          v-for="h in currentProgram.history"
          :key="h.id"
          :timestamp="h.createdAt"
          placement="top"
        >
          <el-card shadow="never">
            <div class="history-item">
              <strong>v{{ h.version }}</strong> - {{ h.description }}
              <el-button link type="primary" @click="handleRollback(h.version)">回退到此版本</el-button>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      <el-empty v-else description="暂无历史记录" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, VideoCamera } from '@element-plus/icons-vue'
import { useProgramStore } from '@/stores/program'
import type { Program } from '@/types'

const programStore = useProgramStore()
const searchQuery = ref('')
const filterStatus = ref('')
const tableData = ref<Program[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const historyDialogVisible = ref(false)
const currentProgram = ref<Program | null>(null)

function statusType(status: string) {
  const map: Record<string, string> = { draft: 'info', pending: 'warning', published: 'success', archived: 'danger' }
  return map[status] || 'info'
}
function statusText(status: string) {
  const map: Record<string, string> = { draft: '草稿', pending: '待审', published: '已发布', archived: '已归档' }
  return map[status] || status
}

async function fetchData() {
  loading.value = true
  try {
    const params: Record<string, unknown> = {}
    if (searchQuery.value) params.keyword = searchQuery.value
    if (filterStatus.value) params.status = filterStatus.value
    await programStore.fetchList(params)
    tableData.value = programStore.programs
    total.value = programStore.programs.length
  } finally {
    loading.value = false
  }
}

function handlePreview(row: Program) {
  ElMessage.info('预览功能：打开模拟观众端视图')
}

function handleHistory(row: Program) {
  currentProgram.value = row
  historyDialogVisible.value = true
}

async function handleRollback(version: number) {
  if (!currentProgram.value) return
  await ElMessageBox.confirm(`确定回退到 v${version} 吗？`, '警告', { type: 'warning' })
  ElMessage.success('已回退到指定版本')
  historyDialogVisible.value = false
}

async function handleDelete(row: Program) {
  await ElMessageBox.confirm(`确定删除节目《${row.title}》吗？`, '警告', { type: 'warning' })
  await programStore.remove(row.id)
  ElMessage.success('删除成功')
  fetchData()
}

onMounted(fetchData)
</script>

<style scoped>
.pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 16px; }
.program-title-cell { display: flex; align-items: flex-start; gap: 12px; }
.program-cover, .program-cover-placeholder {
  width: 60px; height: 40px; border-radius: 4px; overflow: hidden; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; background: #f5f5f5; color: #999;
}
.program-cover img { width: 100%; height: 100%; object-fit: cover; }
.program-info { flex: 1; min-width: 0; }
.program-name { font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
.program-desc { font-size: 12px; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.history-item { display: flex; justify-content: space-between; align-items: center; }
</style>

