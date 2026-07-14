<template>
  <div class="page-card">
    <div class="section-header">
      <h3>操作日志</h3>
      <el-button @click="fetchData"><el-icon><Refresh /></el-icon> 刷新</el-button>
    </div>
    <div class="filter-bar">
      <el-input v-model="filterUser" placeholder="搜索用户名" clearable style="width: 160px" />
      <el-select v-model="filterAction" placeholder="操作类型" clearable style="width: 140px">
        <el-option label="创建" value="创建" /><el-option label="更新" value="更新" /><el-option label="删除" value="删除" /><el-option label="发布" value="发布" />
      </el-select>
      <el-date-picker v-model="filterDate" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" style="width: 260px" />
      <el-button type="primary" @click="fetchData">筛选</el-button>
    </div>
    <el-table :data="filteredLogs" v-loading="loading" stripe style="width: 100%; margin-top: 16px">
      <el-table-column prop="userName" label="用户" width="100" />
      <el-table-column label="操作" width="100">
        <template #default="{ row }">{{ row.action }}{{ row.targetType }}</template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="250" show-overflow-tooltip />
      <el-table-column prop="ip" label="IP" width="150" />
      <el-table-column prop="createdAt" label="时间" width="180" sortable />
    </el-table>
    <div class="pagination-wrapper">
      <el-pagination v-model:current-page="currentPage" :page-size="20" :total="mockLogs.length" layout="total, prev, pager, next" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'

const filterUser = ref('')
const filterAction = ref('')
const filterDate = ref(null)
const loading = ref(false)
const currentPage = ref(1)

const mockLogs = ref([
  { id: 1, userName: '管理员', action: '创建', targetType: '文章', description: '管理员 创建了文章 #1', ip: '192.168.1.1', createdAt: '2024-07-14 10:00:00' },
  { id: 2, userName: '张三', action: '更新', targetType: '节目', description: '张三 更新了节目 #5', ip: '192.168.1.12', createdAt: '2024-07-14 09:30:00' },
  { id: 3, userName: '李四', action: '审核', targetType: '文章', description: '李四 审核了文章 #12', ip: '192.168.1.25', createdAt: '2024-07-13 16:00:00' },
  { id: 4, userName: '管理员', action: '删除', targetType: '素材', description: '管理员 删除了素材 #88', ip: '192.168.1.1', createdAt: '2024-07-13 14:00:00' },
  { id: 5, userName: '张三', action: '发布', targetType: '节目', description: '张三 发布了节目 #3', ip: '192.168.1.12', createdAt: '2024-07-12 11:00:00' },
])

const filteredLogs = computed(() => {
  return mockLogs.value.filter(log => {
    if (filterUser.value && !log.userName.includes(filterUser.value)) return false
    if (filterAction.value && log.action !== filterAction.value) return false
    return true
  })
})

function fetchData() { loading.value = true; setTimeout(() => { loading.value = false }, 500) }

onMounted(fetchData)
</script>

<style scoped>
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h3 { margin: 0; font-size: 16px; }
.filter-bar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
