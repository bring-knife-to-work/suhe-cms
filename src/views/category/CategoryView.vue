<template>
  <div class="page-card">
    <el-row :gutter="16">
      <!-- Categories -->
      <el-col :xs="24" :md="14">
        <div class="section-header">
          <h3>分类管理</h3>
          <el-button type="primary" size="small" @click="showAddCategory"><el-icon><Plus /></el-icon> 新增分类</el-button>
        </div>
        <el-tree
          :data="categories"
          :props="{ label: 'name', children: 'children' }"
          node-key="id"
          default-expand-all
          draggable
          highlight-current
          @node-drop="handleNodeDrop"
        >
          <template #default="{ node, data }">
            <span class="category-node">
              <span>{{ node.label }}</span>
              <span class="category-actions">
                <el-button link type="primary" size="small" @click="showEditCategory(data)">编辑</el-button>
                <el-button link type="danger" size="small" @click="handleDeleteCategory(data)">删除</el-button>
              </span>
            </span>
          </template>
        </el-tree>
      </el-col>

      <!-- Tags -->
      <el-col :xs="24" :md="10">
        <div class="section-header">
          <h3>标签管理</h3>
          <el-button type="primary" size="small" @click="showAddTag"><el-icon><Plus /></el-icon> 新增标签</el-button>
        </div>
        <div class="tags-list">
          <el-tag
            v-for="tag in tags"
            :key="tag.id"
            :closable="true"
            closable-type="fill"
            style="margin: 0 8px 8px 0"
            @close="handleDeleteTag(tag)"
          >
            {{ tag.name }} ({{ tag.usageCount }})
          </el-tag>
        </div>
      </el-col>
    </el-row>

    <!-- Category Dialog -->
    <el-dialog v-model="categoryDialogVisible" :title="categoryForm.id ? '编辑分类' : '新增分类'" width="400px">
      <el-form :model="categoryForm" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="父级">
          <el-select v-model="categoryForm.parentId" placeholder="顶级分类" style="width: 100%">
            <el-option label="无（顶级分类）" :value="null" />
            <el-option v-for="c in categoriesFlat" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="categoryForm.sort" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCategory">确定</el-button>
      </template>
    </el-dialog>

    <!-- Tag Dialog -->
    <el-dialog v-model="tagDialogVisible" title="新增标签" width="400px">
      <el-input v-model="newTagName" placeholder="请输入标签名称" @keyup.enter="saveTag" />
      <template #footer>
        <el-button @click="tagDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTag">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { CategoryNode } from '@/types'

const categories = ref<CategoryNode[]>([
  { id: 1, name: '科技', parentId: null, sort: 1, children: [
    { id: 11, name: '人工智能', parentId: 1, sort: 1, children: [] },
    { id: 12, name: '云计算', parentId: 1, sort: 2, children: [] },
  ]},
  { id: 2, name: '文化', parentId: null, sort: 2, children: [] },
  { id: 3, name: '生活', parentId: null, sort: 3, children: [] },
])

const tags = ref([
  { id: 1, name: '推荐', usageCount: 15 },
  { id: 2, name: '热门', usageCount: 23 },
  { id: 3, name: '精选', usageCount: 8 },
  { id: 4, name: '原创', usageCount: 12 },
])

const categoryDialogVisible = ref(false)
const tagDialogVisible = ref(false)
const newTagName = ref('')
const categoriesFlat = ref<CategoryNode[]>([])

const categoryForm = reactive({ id: null as number | null, name: '', parentId: null as number | null, sort: 0 })

function flattenCategories(nodes: CategoryNode[], list: CategoryNode[] = []) {
  nodes.forEach(n => { list.push(n); if (n.children) flattenCategories(n.children, list) })
  return list
}
categoriesFlat.value = flattenCategories(categories.value)

function showAddCategory() { Object.assign(categoryForm, { id: null, name: '', parentId: null, sort: 0 }); categoryDialogVisible.value = true }
function showEditCategory(data: CategoryNode) { Object.assign(categoryForm, { id: data.id, name: data.name, parentId: data.parentId, sort: data.sort }); categoryDialogVisible.value = true }
function showAddTag() { newTagName.value = ''; tagDialogVisible.value = true }

async function saveCategory() {
  if (!categoryForm.name) { ElMessage.warning('请输入分类名称'); return }
  const newCat: CategoryNode = { id: categoryForm.id || Date.now(), name: categoryForm.name, parentId: categoryForm.parentId, sort: categoryForm.sort, children: [] }
  if (categoryForm.id) {
    ElMessage.success('分类更新成功')
  } else {
    categories.value.push(newCat)
    ElMessage.success('分类创建成功')
  }
  categoryDialogVisible.value = false
}

async function saveTag() {
  if (!newTagName.value) return
  tags.value.push({ id: Date.now(), name: newTagName.value, usageCount: 0 })
  tagDialogVisible.value = false
  ElMessage.success('标签创建成功')
}

async function handleDeleteCategory(data: CategoryNode) {
  await ElMessageBox.confirm(`确定删除分类「${data.name}」吗？`, '警告', { type: 'warning' })
  categories.value = categories.value.filter(c => c.id !== data.id)
  ElMessage.success('删除成功')
}

async function handleDeleteTag(tag: any) {
  tags.value = tags.value.filter(t => t.id !== tag.id)
  ElMessage.success('标签已删除')
}

function handleNodeDrop() { ElMessage.success('排序已更新') }
</script>

<style scoped>
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h3 { margin: 0; font-size: 16px; }
.category-node { display: flex; align-items: center; justify-content: space-between; flex: 1; }
.category-actions { display: none; }
.category-node:hover .category-actions { display: flex; gap: 4px; }
.tags-list { padding: 8px 0; }
</style>

