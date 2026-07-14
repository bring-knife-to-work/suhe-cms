<template>
  <div class="page-card">
    <div class="section-header">
      <h3>用户列表</h3>
      <div class="header-actions">
        <el-input v-model="keyword" placeholder="搜索用户名/昵称/邮箱" clearable style="width: 220px" @clear="onSearch" @keyup.enter="onSearch" />
        <el-button type="primary" @click="onSearch">搜索</el-button>
        <el-button type="primary" @click="showAddUser"><el-icon><Plus /></el-icon> 新增用户</el-button>
      </div>
    </div>
    <el-table :data="tableData" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="username" label="用户名" width="140" />
      <el-table-column prop="nickname" label="昵称" width="120" />
      <el-table-column prop="email" label="邮箱" min-width="180" />
      <el-table-column label="角色" width="120">
        <template #default="{ row }">
          <el-tag :type="roleType(row.role)" effect="dark" size="small">{{ roleText(row.role) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="170" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="showEditUser(row)">编辑</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
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

    <el-dialog v-model="userDialogVisible" :title="userForm.id ? '编辑用户' : '新增用户'" width="500px">
      <el-form :model="userForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="userForm.username" :disabled="!!userForm.id" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="userForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="userForm.role" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="编辑" value="editor" />
            <el-option label="审核员" value="reviewer" />
            <el-option label="访客" value="guest" />
          </el-select>
        </el-form-item>
        <el-form-item label="密码" v-if="!userForm.id">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUser">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { http } from '@/utils/request'
import { unwrapPageResult } from '@/utils/page'
import PaginationBar from '@/components/common/PaginationBar.vue'
import type { User, PageResult } from '@/types'

const keyword = ref('')
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tableData = ref<User[]>([])
const userDialogVisible = ref(false)
const userForm = reactive({
  id: null as number | null,
  username: '',
  nickname: '',
  email: '',
  role: 'editor' as string,
  password: '',
})

function roleType(role: string) {
  const map: Record<string, string> = { admin: 'danger', editor: 'primary', reviewer: 'warning', guest: 'info' }
  return map[role] || 'info'
}
function roleText(role: string) {
  const map: Record<string, string> = { admin: '管理员', editor: '编辑', reviewer: '审核员', guest: '访客' }
  return map[role] || role
}

async function fetchData() {
  loading.value = true
  try {
    const res = await http.get<User[] | PageResult<User>>('/users', {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value,
        keyword: keyword.value || undefined,
      },
    })
    const page = unwrapPageResult(res.data)
    tableData.value = page.list
    total.value = page.total
  } finally {
    loading.value = false
  }
}

function onSearch() {
  currentPage.value = 1
  fetchData()
}

function showAddUser() {
  Object.assign(userForm, { id: null, username: '', nickname: '', email: '', role: 'editor', password: '' })
  userDialogVisible.value = true
}

function showEditUser(row: User) {
  Object.assign(userForm, {
    id: row.id,
    username: row.username,
    nickname: row.nickname,
    email: row.email,
    role: row.role,
    password: '',
  })
  userDialogVisible.value = true
}

async function saveUser() {
  if (!userForm.username || !userForm.nickname) {
    ElMessage.warning('请填写必要信息')
    return
  }
  if (userForm.id) {
    await http.put('/users/' + userForm.id, {
      nickname: userForm.nickname,
      email: userForm.email,
      role: userForm.role,
    })
    ElMessage.success('用户更新成功')
  } else {
    await http.post('/users', { ...userForm })
    ElMessage.success('用户创建成功')
  }
  userDialogVisible.value = false
  fetchData()
}

async function handleDelete(row: User) {
  await ElMessageBox.confirm(`确定删除用户「${row.nickname}」吗？`, '警告', { type: 'warning' })
  await http.delete('/users/' + row.id)
  ElMessage.success('删除成功')
  fetchData()
}

onMounted(fetchData)
</script>

<style scoped>
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 12px; flex-wrap: wrap; }
.section-header h3 { margin: 0; font-size: 16px; }
.header-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
</style>
