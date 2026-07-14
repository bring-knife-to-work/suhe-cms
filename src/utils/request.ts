import axios from 'axios'
import { ElMessage } from 'element-plus'
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
}

class Request {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    })

    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = Bearer 
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const res = response.data
        if (res.code !== 0 && res.code !== 200) {
          ElMessage.error(res.message || '请求失败')
          if (res.code === 401) {
            localStorage.removeItem('token')
            window.location.href = '/login'
          }
          return Promise.reject(new Error(res.message || '请求失败'))
        }
        return response
      },
      (error) => {
        const message = error.response?.data?.message || error.message || '网络错误'
        ElMessage.error(message)
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.get<ApiResponse<T>>(url, config)
  }

  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.post<ApiResponse<T>>(url, data, config)
  }

  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.put<ApiResponse<T>>(url, data, config)
  }

  delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.delete<ApiResponse<T>>(url, config)
  }
}

export const http = new Request()
export default http
