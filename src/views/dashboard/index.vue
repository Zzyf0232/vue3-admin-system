<template>
  <div class="dashboard">
    <!-- 数据卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6" v-for="item in statData" :key="item.title">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" :style="{ background: item.color }">
              <el-icon :size="28" color="#fff">
                <component :is="item.icon" />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ item.value }}</div>
              <div class="stat-title">{{ item.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>访问趋势</span>
            </div>
          </template>
          <div ref="lineChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>用户分布</span>
            </div>
          </template>
          <div ref="pieChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 待办事项 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最新动态</span>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(item, index) in activities"
              :key="index"
              :timestamp="item.time"
              :type="item.type"
            >
              {{ item.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>快捷入口</span>
            </div>
          </template>
          <div class="quick-entry">
            <div
              v-for="item in quickEntries"
              :key="item.name"
              class="entry-item"
              @click="router.push(item.path)"
            >
              <el-icon :size="24" :color="item.color">
                <component :is="item.icon" />
              </el-icon>
              <span>{{ item.name }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'

const router = useRouter()

const statData = [
  { title: '用户总数', value: '1,286', icon: 'User', color: '#409eff' },
  { title: '今日访问', value: '328', icon: 'View', color: '#67c23a' },
  { title: '订单数量', value: '156', icon: 'ShoppingCart', color: '#e6a23c' },
  { title: '消息通知', value: '12', icon: 'Bell', color: '#f56c6c' }
]

const activities = [
  { content: '管理员登录系统', time: '2024-10-09 09:30', type: 'primary' },
  { content: '新增用户「郑十」', time: '2024-10-09 10:15', type: 'success' },
  { content: '用户「王五」被禁用', time: '2024-10-09 11:20', type: 'warning' },
  { content: '系统数据备份完成', time: '2024-10-09 14:00', type: 'info' },
  { content: '检测到异常登录', time: '2024-10-09 15:30', type: 'danger' }
]

const quickEntries = [
  { name: '用户管理', icon: 'User', path: '/user', color: '#409eff' },
  { name: '数据看板', icon: 'DataAnalysis', path: '/dashboard', color: '#67c23a' },
  { name: '系统设置', icon: 'Setting', path: '/settings', color: '#e6a23c' },
  { name: '消息通知', icon: 'Bell', path: '/dashboard', color: '#f56c6c' }
]

const lineChartRef = ref()
const pieChartRef = ref()
let lineChart = null
let pieChart = null

function initLineChart() {
  lineChart = echarts.init(lineChartRef.value)
  lineChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['访问量', '注册量'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '5%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '访问量',
        type: 'line',
        smooth: true,
        data: [320, 432, 501, 634, 790, 930, 820],
        itemStyle: { color: '#409eff' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64,158,255,0.3)' },
              { offset: 1, color: 'rgba(64,158,255,0)' }
            ]
          }
        }
      },
      {
        name: '注册量',
        type: 'line',
        smooth: true,
        data: [120, 132, 101, 134, 90, 230, 210],
        itemStyle: { color: '#67c23a' }
      }
    ]
  })
}

function initPieChart() {
  pieChart = echarts.init(pieChartRef.value)
  pieChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        name: '用户角色',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        data: [
          { value: 5, name: '管理员' },
          { value: 48, name: '编辑' },
          { value: 120, name: '访客' }
        ],
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' }
        }
      }
    ]
  })
}

function handleResize() {
  lineChart && lineChart.resize()
  pieChart && pieChart.resize()
}

onMounted(() => {
  nextTick(() => {
    initLineChart()
    initPieChart()
  })
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  lineChart && lineChart.dispose()
  pieChart && pieChart.dispose()
})
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stat-title {
  font-size: 13px;
  color: #909399;
  margin-top: 2px;
}

.card-header {
  font-weight: 600;
  color: #303133;
}

.quick-entry {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.entry-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 10px;
  border-radius: 8px;
  background: #f5f7fa;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  color: #606266;
}

.entry-item:hover {
  background: #ecf5ff;
  color: #409eff;
  transform: translateY(-2px);
}
</style>