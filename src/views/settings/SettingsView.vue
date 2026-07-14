<template>
  <div class="page-card">
    <h3 class="section-title">系统设置</h3>
    <el-form :model="config" label-width="160px" class="settings-form">
      <el-divider content-position="left">站点信息</el-divider>
      <el-form-item label="站点名称">
        <el-input v-model="config.siteName" placeholder="请输入站点名称" />
      </el-form-item>
      <el-form-item label="站点 Logo">
        <el-upload class="logo-uploader" action="#" :auto-upload="false" :show-file-list="false" @change="handleLogoChange">
          <img v-if="config.logo" :src="config.logo" class="logo-preview" />
          <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="默认语言">
        <el-radio-group v-model="config.language">
          <el-radio value="zh-CN">简体中文</el-radio>
          <el-radio value="en-US">English</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-divider content-position="left">上传设置</el-divider>
      <el-form-item label="最大上传大小(MB)">
        <el-input-number v-model="config.maxUploadSize" :min="1" :max="500" />
      </el-form-item>
      <el-form-item label="允许格式">
        <el-checkbox-group v-model="config.allowedFormats">
          <el-checkbox value="jpg">JPG</el-checkbox>
          <el-checkbox value="jpeg">JPEG</el-checkbox>
          <el-checkbox value="png">PNG</el-checkbox>
          <el-checkbox value="gif">GIF</el-checkbox>
          <el-checkbox value="mp4">MP4</el-checkbox>
          <el-checkbox value="avi">AVI</el-checkbox>
          <el-checkbox value="mp3">MP3</el-checkbox>
          <el-checkbox value="pdf">PDF</el-checkbox>
          <el-checkbox value="doc">DOC</el-checkbox>
          <el-checkbox value="docx">DOCX</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-divider content-position="left">内容设置</el-divider>
      <el-form-item label="默认分类">
        <el-select v-model="config.defaultCategoryId" placeholder="选择默认分类" style="width: 200px">
          <el-option label="科技" :value="1" /><el-option label="文化" :value="2" /><el-option label="生活" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="自动保存间隔(秒)">
        <el-input-number v-model="config.autoSaveInterval" :min="10" :max="300" />
      </el-form-item>
      <el-form-item label="开启评论">
        <el-switch v-model="config.enableComments" />
      </el-form-item>

      <el-divider content-position="left">安全设置</el-divider>
      <el-form-item label="登录失败锁定(次)">
        <el-input-number v-model="config.maxLoginAttempts" :min="3" :max="10" />
      </el-form-item>
      <el-form-item label="会话超时(分钟)">
        <el-input-number v-model="config.sessionTimeout" :min="15" :max="480" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSave">保存设置</el-button>
        <el-button @click="handleReset">恢复默认</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const config = reactive({
  siteName: 'Vue CMS Admin',
  logo: '',
  language: 'zh-CN',
  maxUploadSize: 100,
  allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mp3', 'pdf'],
  defaultCategoryId: 1,
  autoSaveInterval: 60,
  enableComments: true,
  maxLoginAttempts: 5,
  sessionTimeout: 120,
})

function handleLogoChange(file: any) {
  const reader = new FileReader()
  reader.onload = (e) => { config.logo = e.target?.result as string }
  reader.readAsDataURL(file.raw)
}

function handleSave() {
  ElMessage.success('设置保存成功')
}

function handleReset() {
  Object.assign(config, {
    siteName: 'Vue CMS Admin', logo: '', language: 'zh-CN',
    maxUploadSize: 100, allowedFormats: ['jpg', 'jpeg', 'png'],
    defaultCategoryId: 1, autoSaveInterval: 60, enableComments: true,
    maxLoginAttempts: 5, sessionTimeout: 120,
  })
  ElMessage.info('已恢复默认设置')
}
</script>

<style scoped>
.section-title { margin: 0 0 24px; font-size: 18px; }
.settings-form { max-width: 800px; }
.logo-uploader :deep(.el-upload) { border: 1px dashed #d9d9d9; border-radius: 6px; cursor: pointer; overflow: hidden; }
.logo-uploader :deep(.el-upload:hover) { border-color: #409eff; }
.logo-uploader-icon { width: 120px; height: 120px; font-size: 28px; color: #8c939d; display: flex; align-items: center; justify-content: center; background: #fafafa; }
.logo-preview { width: 120px; height: 120px; display: block; object-fit: cover; }
:deep(.el-divider__text) { font-weight: 600; font-size: 15px; }
</style>
