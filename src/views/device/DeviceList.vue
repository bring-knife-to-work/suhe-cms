<template>
  <div class="page-card">
    <div class="page-toolbar">
      <div class="toolbar-left">
        <el-input v-model="keyword" placeholder="搜索设备名称/编码/位置" clearable style="width: 240px" @clear="onSearch" @keyup.enter="onSearch">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="status" placeholder="状态" clearable style="width: 130px" @change="onSearch">
          <el-option label="在线" value="online" />
          <el-option label="离线" value="offline" />
          <el-option label="同步中" value="syncing" />
          <el-option label="异常" value="error" />
        </el-select>
        <el-button type="primary" @click="onSearch">搜索</el-button>
      </div>
      <el-button type="primary" @click="openCreate"><el-icon><Plus /></el-icon> 添加设备</el-button>
    </div>

    <div class="stats-row">
      <div class="stat-pill online"><strong>{{ onlineCount }}</strong><span>在线</span></div>
      <div class="stat-pill offline"><strong>{{ offlineCount }}</strong><span>离线</span></div>
      <div class="stat-pill syncing"><strong>{{ syncingCount }}</strong><span>同步中</span></div>
    </div>

    <el-table :data="tableData" v-loading="deviceStore.loading" stripe>
      <el-table-column prop="name" label="设备名称" min-width="150" />
      <el-table-column prop="code" label="设备编码" width="140" />
      <el-table-column prop="location" label="位置" width="140" />
      <el-table-column prop="group" label="分组" width="110" />
      <el-table-column prop="resolution" label="分辨率" width="110" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="当前节目" min-width="140">
        <template #default="{ row }">{{ row.currentProgramTitle || '—' }}</template>
      </el-table-column>
      <el-table-column prop="lastSeen" label="最近心跳" width="170" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <PaginationBar
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50]"
      @change="fetchData"
    />

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑设备' : '添加设备'" width="480px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="名称" required>
          <el-input v-model="form.name" placeholder="大厅左侧屏" />
        </el-form-item>
        <el-form-item label="编码" required>
          <el-input v-model="form.code" placeholder="DEV-001" />
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="form.location" placeholder="一楼大厅" />
        </el-form-item>
        <el-form-item label="分组">
          <el-input v-model="form.group" placeholder="默认分组" />
        </el-form-item>
        <el-form-item label="分辨率">
          <el-select v-model="form.resolution" style="width: 100%">
            <el-option label="1920x1080" value="1920x1080" />
            <el-option label="1280x720" value="1280x720" />
            <el-option label="3840x2160" value="3840x2160" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { useDeviceStore } from '@/stores/device'
import PaginationBar from '@/components/common/PaginationBar.vue'
import type { Device, DeviceStatus } from '@/types'

const deviceStore = useDeviceStore()
const keyword = ref('')
const status = ref('')
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tableData = ref<Device[]>([])
const onlineCount = ref(0)
const offlineCount = ref(0)
const syncingCount = ref(0)

const form = reactive({
  name: '',
  code: '',
  location: '',
  group: '默认分组',
  resolution: '1920x1080',
})

function statusTag(s: DeviceStatus) {
  return ({ online: 'success', offline: 'info', syncing: 'warning', error: 'danger' } as const)[s]
}
function statusText(s: DeviceStatus) {
  return ({ online: '在线', offline: '离线', syncing: '同步中', error: '异常' } as const)[s]
}

async function refreshStats() {
  const all = await deviceStore.fetchList({ page: 1, pageSize: 9999 })
  onlineCount.value = all.list.filter((d) => d.status === 'online').length
  offlineCount.value = all.list.filter((d) => d.status === 'offline').length
  syncingCount.value = all.list.filter((d) => d.status === 'syncing').length
}

async function fetchData() {
  const page = await deviceStore.fetchList({
    page: currentPage.value,
    pageSize: pageSize.value,
    keyword: keyword.value || undefined,
    status: status.value || undefined,
  })
  tableData.value = page.list
  total.value = page.total
}

function onSearch() {
  currentPage.value = 1
  fetchData()
}

function openCreate() {
  editingId.value = null
  Object.assign(form, { name: '', code: '', location: '', group: '默认分组', resolution: '1920x1080' })
  dialogVisible.value = true
}

function openEdit(row: Device) {
  editingId.value = row.id
  Object.assign(form, {
    name: row.name,
    code: row.code,
    location: row.location,
    group: row.group,
    resolution: row.resolution,
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!form.name || !form.code) {
    ElMessage.warning('请填写名称和编码')
    return
  }
  if (editingId.value) {
    await deviceStore.update(editingId.value, { ...form })
    ElMessage.success('已更新')
  } else {
    await deviceStore.create({ ...form })
    ElMessage.success('已添加')
  }
  dialogVisible.value = false
  await Promise.all([fetchData(), refreshStats()])
}

async function handleDelete(row: Device) {
  await ElMessageBox.confirm(`确定删除设备「${row.name}」吗？`, '提示', { type: 'warning' })
  await deviceStore.remove(row.id)
  ElMessage.success('已删除')
  await Promise.all([fetchData(), refreshStats()])
}

onMounted(async () => {
  await refreshStats()
  await fetchData()
})
</script>

<style scoped>
.stats-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.stat-pill {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 999px;
  background: var(--surface-muted);
  border: 1px solid var(--border-color);
  font-size: 13px;
  color: var(--text-secondary);
}
.stat-pill strong {
  font-size: 18px;
  color: var(--text-primary);
}
.stat-pill.online strong { color: var(--success-color); }
.stat-pill.offline strong { color: var(--text-secondary); }
.stat-pill.syncing strong { color: var(--warning-color); }
</style>
