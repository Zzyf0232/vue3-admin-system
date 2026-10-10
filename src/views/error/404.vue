<template>
  <div class="not-found">
    <div class="content">
      <h1>404</h1>
      <p>页面走丢了</p>
      <el-button type="primary" @click="router.push('/')">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped>
.not-found {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
}

.content {
  text-align: center;
}

.content h1 {
  font-size: 80px;
  color: #409eff;
  margin-bottom: 10px;
}

.content p {
  font-size: 18px;
  color: #909399;
  margin-bottom: 20px;
}
</style>