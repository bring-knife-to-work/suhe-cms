<template>
  <div class="page-card">
    <div class="section-header">
      <h3>操作日志</h3>
      <el-button @click="fetchData"><el-icon><Refresh /></el-icon> 刷新</el-button>
    </div>
    <div class="filter-bar">
      <el-input v-model="filterUser" placeholder="搜索用户名" clearable style="width: 160px" @clear="onSearch" />
      <el-select v-model="filterAction" placeholder="操作类型" clearable style="width: 140px" @change="onSearch">
        <el-option label="创建" value="创建" />
        <el-option label="更新" value="更新" />
        <el-option label="删除" value="删除" />
        <el-option label="发布" value="发布" />
      </el-select>
      <el-button type="primary" @click="onSearch">筛选</el-button>
    </div>
    <el-table :data="tableData" v-loading="loading" stripe style="width: 100%; margin-top: 16px">
      <el-table-column prop="userName" label="用户" width="100" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">{{ row.action }}{{ row.targetType }}</template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="250" show-overflow-tooltip />
      <el-table-column prop="ip" label="IP" width="150" />
      <el-table-column prop="createdAt" label="时间" width="180" sortable />
    </el-table>
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
import { Refresh } from '@element-plus/icons-vue'
import { useOperationLogStore } from '@/stores/media'
import PaginationBar from '@/components/common/PaginationBar.vue'
import type { OperationLog } from '@/types'

const logStore = useOperationLogStore()
const filterUser = ref('')
const filterAction = ref('')
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const tableData = ref<OperationLog[]>([])

async function fetchData() {
  loading.value = true
  try {
    await logStore.fetchList({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: filterUser.value || undefined,
      action: filterAction.value || undefined,
    })
    tableData.value = logStore.logs
    total.value = logStore.total
  } finally {
    loading.value = false
  }
}

function onSearch() {
  currentPage.value = 1
  fetchData()
}

onMounted(fetchData)
</script>

<style scoped>
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h3 { margin: 0; font-size: 16px; }
.filter-bar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
</style>
