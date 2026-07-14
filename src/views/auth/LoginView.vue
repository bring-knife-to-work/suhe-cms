<template>
  <div class="login-page" :class="{ dark: appStore.darkMode }" :style="{ '--login-bg-image': `url(${loginBg})` }">
    <button class="theme-fab" type="button" @click="appStore.toggleTheme()">
      <el-icon><Sunny v-if="appStore.darkMode" /><Moon v-else /></el-icon>
      {{ appStore.darkMode ? '白天模式' : '黑夜模式' }}
    </button>

    <div class="login-stage">
      <section class="brand-panel">
        <p class="brand-kicker">suhe CMS</p>
        <h1>{{ appTitle }}</h1>
        <p class="brand-desc">节目画布编排 · 素材填充 · 设备一键下发</p>
        <ul class="brand-points">
          <li>可视化画布快速拼装屏幕节目</li>
          <li>素材点击填充，预览所见即所得</li>
          <li>按设备分组下发，状态实时回传</li>
        </ul>
      </section>

      <section class="login-panel">
        <div class="login-header">
          <h2>登录控制台</h2>
          <p>使用账户进入投放管理</p>
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
            <el-button type="primary" size="large" class="login-btn" :loading="authStore.loading" @click="handleLogin">
              登 录
            </el-button>
          </el-form-item>
          <div class="demo-tips">演示账号: admin / admin123</div>
        </el-form>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Moon, Sunny } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import loginBg from '@/assets/login-bg.jpg'

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()
const formRef = ref()
const remember = ref(true)
const form = ref({ username: 'admin', password: 'admin123' })

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' },
  ],
}

const appTitle = computed(() => import.meta.env.VITE_APP_TITLE || 'suhe CMS')

async function handleLogin() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  try {
    await authStore.login(form.value)
    if (!remember.value) {
      // session-only preference: still keep token for SPA session; no extra long-term key
    }
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
  display: grid;
  place-items: center;
  padding: 24px;
  position: relative;
  background-color: #d7e6ec;
  background-image:
    radial-gradient(900px 420px at 12% 18%, rgba(20, 184, 166, 0.22), transparent 55%),
    radial-gradient(700px 360px at 88% 82%, rgba(15, 118, 110, 0.16), transparent 50%),
    linear-gradient(145deg, rgba(232, 242, 241, 0.88) 0%, rgba(215, 230, 236, 0.82) 45%, rgba(237, 241, 245, 0.9) 100%),
    var(--login-bg-image);
  background-size: cover, cover, cover, cover;
  background-position: center;
  background-repeat: no-repeat;
}

.login-page.dark {
  background-color: #071018;
  background-image:
    radial-gradient(900px 420px at 12% 18%, rgba(45, 212, 191, 0.12), transparent 55%),
    radial-gradient(700px 360px at 88% 82%, rgba(15, 118, 110, 0.18), transparent 50%),
    linear-gradient(145deg, rgba(7, 16, 24, 0.92) 0%, rgba(11, 23, 36, 0.88) 50%, rgba(16, 26, 40, 0.9) 100%),
    var(--login-bg-image);
}

.theme-fab {
  position: absolute;
  top: 20px;
  right: 20px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--border-color);
  background: color-mix(in srgb, var(--surface-elevated) 90%, transparent);
  color: var(--text-regular);
  border-radius: 999px;
  padding: 8px 14px;
  cursor: pointer;
}

.login-stage {
  width: min(980px, 100%);
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  overflow: hidden;
  border-radius: 22px;
  border: 1px solid color-mix(in srgb, #0f766e 20%, transparent);
  background: color-mix(in srgb, var(--surface-elevated) 92%, transparent);
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(12px);
}

.brand-panel {
  padding: 48px 40px;
  color: #ecfeff;
  background:
    linear-gradient(160deg, rgba(15, 118, 110, 0.95), rgba(15, 36, 58, 0.92)),
    url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.brand-kicker {
  margin: 0 0 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-size: 12px;
  opacity: 0.8;
}

.brand-panel h1 {
  margin: 0;
  font-size: clamp(32px, 4vw, 42px);
  line-height: 1.15;
  font-weight: 700;
}

.brand-desc {
  margin: 14px 0 28px;
  font-size: 15px;
  opacity: 0.9;
}

.brand-points {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 10px;
  font-size: 14px;
  opacity: 0.92;
}

.login-panel {
  padding: 48px 40px;
}

.login-header h2 {
  margin: 0 0 8px;
  font-size: 24px;
  color: var(--text-primary);
}

.login-header p {
  margin: 0 0 28px;
  color: var(--text-secondary);
}

.login-options {
  width: 100%;
}

.login-btn {
  width: 100%;
  height: 44px;
  letter-spacing: 0.35em;
}

.demo-tips {
  text-align: center;
  font-size: 12px;
  color: var(--text-secondary);
}

@media (max-width: 860px) {
  .login-stage {
    grid-template-columns: 1fr;
  }
  .brand-panel {
    padding: 32px 28px;
  }
  .login-panel {
    padding: 32px 28px;
  }
}
</style>
