<template>
  <div class="page-card">
    <div class="page-toolbar">
      <div class="toolbar-left">
        <el-input v-model="searchQuery" placeholder="搜索标题/作者" clearable style="width: 220px" @clear="onSearch">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 130px" @change="onSearch">
          <el-option label="草稿" value="draft" />
          <el-option label="待审核" value="pending" />
          <el-option label="已发布" value="published" />
          <el-option label="已驳回" value="rejected" />
        </el-select>
        <el-select v-model="filterCategory" placeholder="分类" clearable style="width: 130px" @change="onSearch">
          <el-option label="科技" value="科技" />
          <el-option label="文化" value="文化" />
          <el-option label="生活" value="生活" />
          <el-option label="娱乐" value="娱乐" />
          <el-option label="体育" value="体育" />
        </el-select>
        <el-button type="primary" @click="onSearch"><el-icon><Search /></el-icon> 搜索</el-button>
        <el-button @click="resetFilter"><el-icon><Refresh /></el-icon> 重置</el-button>
      </div>
      <div>
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
          <el-icon><Delete /></el-icon> 批量删除
        </el-button>
        <el-button type="primary" @click="$router.push('/articles/create')">
          <el-icon><Plus /></el-icon> 新建文章
        </el-button>
      </div>
    </div>

    <div class="table-wrapper">
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange" style="width: 100%">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="authorName" label="作者" width="100" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column label="标签" width="160">
          <template #default="{ row }">
            <el-tag v-for="tag in row.tags" :key="tag" size="small" style="margin-right: 4px">{{ tag }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" effect="dark" size="small">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="浏览量" width="100" sortable />
        <el-table-column prop="createdAt" label="创建时间" width="170" sortable />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="$router.push(`/articles/${row.id}/edit`)">编辑</el-button>
            <el-button link type="success" @click="handlePublish(row)" v-if="row.status !== 'published'">发布</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <PaginationBar
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      @change="fetchData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Delete, Plus } from '@element-plus/icons-vue'
import { useArticleStore } from '@/stores/article'
import PaginationBar from '@/components/common/PaginationBar.vue'
import type { Article } from '@/types'

const articleStore = useArticleStore()
const searchQuery = ref('')
const filterStatus = ref('')
const filterCategory = ref('')
const tableData = ref<Article[]>([])
const loading = ref(false)
const selectedIds = ref<number[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

function statusType(status: string) {
  const map: Record<string, string> = { draft: 'info', pending: 'warning', published: 'success', rejected: 'danger' }
  return map[status] || 'info'
}

function statusText(status: string) {
  const map: Record<string, string> = { draft: '草稿', pending: '待审', published: '已发布', rejected: '已驳回' }
  return map[status] || status
}

async function fetchData() {
  loading.value = true
  try {
    const params: Record<string, unknown> = { page: currentPage.value, pageSize: pageSize.value }
    if (searchQuery.value) params.keyword = searchQuery.value
    if (filterStatus.value) params.status = filterStatus.value
    if (filterCategory.value) params.category = filterCategory.value
    await articleStore.fetchList(params)
    tableData.value = articleStore.articles
    total.value = articleStore.total
    const maxPage = Math.max(1, Math.ceil(total.value / pageSize.value) || 1)
    if (currentPage.value > maxPage) {
      currentPage.value = maxPage
      await articleStore.fetchList({ ...params, page: currentPage.value })
      tableData.value = articleStore.articles
      total.value = articleStore.total
    }
  } finally {
    loading.value = false
  }
}

function onSearch() {
  currentPage.value = 1
  fetchData()
}

function resetFilter() {
  searchQuery.value = ''
  filterStatus.value = ''
  filterCategory.value = ''
  onSearch()
}

function handleSelectionChange(rows: Article[]) {
  selectedIds.value = rows.map((r) => r.id)
}

async function handlePublish(row: Article) {
  await ElMessageBox.confirm(`确定发布《${row.title}》吗？`, '提示', { type: 'info' })
  await articleStore.publish(row.id)
  ElMessage.success('发布成功')
  fetchData()
}

async function handleDelete(row: Article) {
  await ElMessageBox.confirm(`确定删除《${row.title}》吗？`, '警告', { type: 'warning' })
  await articleStore.remove(row.id)
  ElMessage.success('删除成功')
  fetchData()
}

async function handleBatchDelete() {
  await ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 篇文章吗？`, '警告', { type: 'warning' })
  await articleStore.batchDelete(selectedIds.value)
  ElMessage.success('批量删除成功')
  selectedIds.value = []
  fetchData()
}

onMounted(fetchData)
</script>
