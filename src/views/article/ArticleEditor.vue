<template>
  <div class="page-card article-editor-page">
    <div class="editor-header">
      <h2>{{ isEdit ? '编辑文章' : '新建文章' }}</h2>
      <div class="header-actions">
        <el-button @click="$router.back()">取消</el-button>
        <el-button type="primary" @click="handleSave('draft')">保存草稿</el-button>
        <el-button type="success" @click="handleSave('pending')" v-if="!isEdit">提交审核</el-button>
      </div>
    </div>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="editor-form">
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入文章标题" maxlength="100" show-word-limit />
      </el-form-item>
      <el-form-item label="摘要" prop="summary">
        <el-input v-model="form.summary" type="textarea" :rows="3" placeholder="请输入文章摘要" maxlength="300" show-word-limit />
      </el-form-item>
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <el-form-item label="分类">
            <el-select v-model="form.categoryId" placeholder="选择分类" style="width: 100%">
              <el-option label="科技" :value="1" /><el-option label="文化" :value="2" /><el-option label="生活" :value="3" /><el-option label="娱乐" :value="4" /><el-option label="体育" :value="5" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="标签">
            <el-tag v-for="tag in form.tags" :key="tag" closable style="margin-right: 6px" @close="removeTag(tag)">{{ tag }}</el-tag>
            <el-input v-if="inputVisible" v-model="inputValue" ref="inputRef" size="small" style="width: 100px" @blur="handleInputConfirm" @keyup.enter="handleInputConfirm" />
            <el-button v-else size="small" @click="showInput">+ 添加</el-button>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="封面图">
        <el-upload class="cover-uploader" action="#" :auto-upload="false" :show-file-list="false" @change="handleCoverChange">
          <img v-if="form.coverImage" :src="form.coverImage" class="cover-preview" />
          <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="正文">
        <div class="editor-wrapper">
          <wang-editor v-model="form.content" />
        </div>
      </el-form-item>
      <el-form-item label="定时发布">
        <el-switch v-model="form.scheduled" />
        <el-date-picker v-if="form.scheduled" v-model="form.publishTime" type="datetime" placeholder="选择发布时间" style="margin-left: 12px" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import WangEditor from '@/components/WangEditor.vue'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => !!route.params.id)
const formRef = ref()
const inputVisible = ref(false)
const inputValue = ref('')
const inputRef = ref()

const form = reactive({
  title: '', summary: '', content: '', categoryId: 1, tags: [] as string[],
  coverImage: '', scheduled: false, publishTime: null as Date | null,
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  summary: [{ required: true, message: '请输入摘要', trigger: 'blur' }],
}

function removeTag(tag: string) { form.tags = form.tags.filter((t) => t !== tag) }
function showInput() { inputVisible.value = true; setTimeout(() => inputRef.value?.input?.focus(), 200) }
function handleInputConfirm() { if (inputValue.value && !form.tags.includes(inputValue.value)) form.tags.push(inputValue.value); inputVisible.value = false; inputValue.value = '' }
function handleCoverChange(file: any) { const reader = new FileReader(); reader.onload = (e) => { form.coverImage = e.target?.result as string }; reader.readAsDataURL(file.raw) }

async function handleSave(status: string) {
  try {
    await formRef.value?.validate()
    form.status = status
    ElMessage.success(isEdit.value ? '保存成功' : '创建成功')
    router.push('/articles')
  } catch { /* ignored */ }
}

onMounted(async () => {
  if (isEdit.value) {
        form.title = '文章标题 ' + route.params.id
        form.summary = '这是第 ' + route.params.id + ' 篇文章的摘要'
    form.content = '<p>文章内容...</p>'
  }
})
</script>

<style scoped>
.article-editor-page { padding: 24px; }
.editor-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color); }
.editor-header h2 { margin: 0; font-size: 20px; }
.header-actions { display: flex; gap: 8px; }
.editor-form { max-width: 900px; }
.editor-wrapper { border: 1px solid var(--border-color); border-radius: 4px; min-height: 400px; }
.cover-uploader :deep(.el-upload) { border: 1px dashed #d9d9d9; border-radius: 6px; cursor: pointer; overflow: hidden; transition: all 0.3s; }
.cover-uploader :deep(.el-upload:hover) { border-color: #409eff; }
.cover-uploader-icon { font-size: 28px; color: #8c939d; width: 178px; height: 150px; display: flex; align-items: center; justify-content: center; background: #fafafa; }
.cover-preview { width: 178px; height: 150px; display: block; object-fit: cover; }
</style>

