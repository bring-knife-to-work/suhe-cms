import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

const base = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  base,
  build: {
    minify: false,
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 9999,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
