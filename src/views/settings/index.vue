<template>
  <div class="settings">
    <el-card shadow="never">
      <template #header>
        <span>系统设置</span>
      </template>
      <el-form :model="settings" label-width="120px" style="max-width: 500px;">
        <el-form-item label="系统名称">
          <el-input v-model="settings.name" />
        </el-form-item>
        <el-form-item label="系统版本">
          <el-input v-model="settings.version" disabled />
        </el-form-item>
        <el-form-item label="主题颜色">
          <el-color-picker v-model="settings.theme" />
        </el-form-item>
        <el-form-item label="开启通知">
          <el-switch v-model="settings.notification" />
        </el-form-item>
        <el-form-item label="自动备份">
          <el-switch v-model="settings.autoBackup" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave">保存设置</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'

const settings = reactive({
  name: '后台管理系统',
  version: 'v1.0.0',
  theme: '#409eff',
  notification: true,
  autoBackup: false
})

function handleSave() {
  ElMessage.success('设置已保存')
}

function handleReset() {
  Object.assign(settings, {
    name: '后台管理系统',
    version: 'v1.0.0',
    theme: '#409eff',
    notification: true,
    autoBackup: false
  })
  ElMessage.info('已重置')
}
</script>

<style scoped>
.settings {
  max-width: 800px;
}
</style>