<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>{{ appTitle }}</h1>
        <p>节目编辑与素材管理平台</p>
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" class="login-form" @keyup.enter="handleLogin">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :prefix-icon="User" size="large" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" :prefix-icon="Lock" size="large" show-password />
        </el-form-item>
        <el-form-item>
          <div class="login-options">
            <el-checkbox v-model="remember">记住我</el-checkbox>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" class="login-btn" :loading="authStore.loading" @click="handleLogin
          ">
            登 录
          </el-button>
        </el-form-item>
        <div class="demo-tips">
          <p>演示账号: admin / admin123</p>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'


const router = useRouter()
const authStore = useAuthStore()
const formRef = ref()
const remember = ref(false)
const form = ref({ username: '', password: '' })

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '密码至少6位', trigger: 'blur' }],
}

const appTitle = computed(() => import.meta.env.VITE_APP_TITLE || 'CMS Admin')

async function handleLogin() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  try {
    await authStore.login(form.value)
    ElMessage.success('登录成功')
    router.push('/')
  } catch {
    // Error handled by interceptor
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px;
}
.login-container {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 48px 40px;
  width: 420px;
  max-width: 100%;
}
.login-header { text-align: center; margin-bottom: 32px; }
.login-header h1 { font-size: 24px; color: #333; margin: 0 0 8px; }
.login-header p { font-size: 14px; color: #999; margin: 0; }
.login-form { margin-top: 24px; }
.login-options { width: 100%; display: flex; justify-content: space-between; align-items: center; }
.login-btn { width: 100%; height: 44px; font-size: 16px; letter-spacing: 8px; }
.demo-tips { text-align: center; margin-top: 16px; font-size: 12px; color: #bbb; }
</style>
