<template>
  <div class="dashboard-page">
    <!-- Stats Cards -->
    <el-row :gutter="16" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6" v-for="(card, i) in statCards" :key="i">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" :style="{ background: card.color }">
              <el-icon :size="28"><component :is="card.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ card.value }}</div>
              <div class="stat-label">{{ card.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Charts Row -->
    <el-row :gutter="16" class="charts-row">
      <el-col :xs="24" :md="12">
        <el-card shadow="hover">
          <template #header>内容状态分布</template>
          <div ref="pieChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="hover">
          <template #header>素材类型统计</template>
          <div ref="barChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Activity Feed -->
    <el-row :gutter="16" class="activity-row">
      <el-col :xs="24" :md="12">
        <el-card shadow="hover">
          <template #header>近期动态</template>
          <el-timeline>
            <el-timeline-item
              v-for="item in stats?.recentActivities"
              :key="item.id"
              :timestamp="item.time"
              placement="top"
            >
              <el-card shadow="never">
                <span>{{ item.user }} {{ item.action }} {{ item.target }}</span>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="hover">
          <template #header>快捷操作</template>
          <div class="quick-actions">
            <el-button type="primary" @click="$router.push('/articles/create')">新建文章</el-button>
            <el-button type="success" @click="$router.push('/programs/create')">新建节目</el-button>
            <el-button type="warning" @click="$router.push('/media')">上传素材</el-button>
            <el-button @click="$router.push('/articles')">待审内容</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Document, VideoCamera, Picture, TrendCharts, List, UserFilled } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { useDashboardStore } from '@/stores/media'

const dashboardStore = useDashboardStore()
const pieChartRef = ref<HTMLElement>()
const barChartRef = ref<HTMLElement>()
const stats = ref(dashboardStore.stats)
let pieChart: echarts.ECharts | null = null
let barChart: echarts.ECharts | null = null

const statCards = [
  { label: '文章总数', value: '1,258', icon: 'Document', color: '#409eff' },
  { label: '节目总数', value: '367', icon: 'VideoCamera', color: '#67c23a' },
  { label: '素材总量', value: '5,432', icon: 'Picture', color: '#e6a23c' },
  { label: '待审核', value: '12', icon: 'List', color: '#f56c6c' },
]

function initPieChart() {
  if (!pieChartRef.value) return
  pieChart = echarts.init(pieChartRef.value)
  pieChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: '5%', left: 'center' },
    series: [
      {
        name: '内容状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: 18, fontWeight: 'bold' } },
        data: [
          { value: 980, name: '已发布', itemStyle: { color: '#67c23a' } },
          { value: 200, name: '草稿', itemStyle: { color: '#409eff' } },
          { value: 78, name: '已驳回', itemStyle: { color: '#f56c6c' } },
          { value: 12, name: '待审核', itemStyle: { color: '#e6a23c' } },
        ],
      },
    ],
  })
}

function initBarChart() {
  if (!barChartRef.value) return
  barChart = echarts.init(barChartRef.value)
  barChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed' } } },
    yAxis: {
      type: 'category',
      data: ['图片', '视频', '音频', '文档'],
      axisTick: { show: false },
    },
    series: [
      {
        name: '数量',
        type: 'bar',
        data: [2500, 1200, 900, 832],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#409eff' },
            { offset: 1, color: '#79c5ff' },
          ]),
          borderRadius: [0, 4, 4, 0],
        },
        barWidth: '60%',
      },
    ],
  })
}

onMounted(async () => {
  await dashboardStore.fetchStats()
  stats.value = dashboardStore.stats
  initPieChart()
  initBarChart()
})

onUnmounted(() => {
  pieChart?.dispose()
  barChart?.dispose()
})
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.stats-row {
  margin-bottom: 0;
}
.stat-card {
  margin-bottom: 0;
}
.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}
.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
.stat-info {
  flex: 1;
}
.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}
.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 4px;
}
.charts-row,
.activity-row {
  margin-bottom: 0;
}
.chart-container {
  width: 100%;
  height: 300px;
}
.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.quick-actions .el-button {
  width: 100%;
}
</style>
