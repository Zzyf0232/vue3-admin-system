<template>
  <div class="user-manage">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索姓名/手机号"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px;">
            <el-option label="启用" value="启用" />
            <el-option label="禁用" value="禁用" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="never" class="table-card">
      <div class="table-header">
        <el-button type="primary" @click="openDialog(null)">
          <el-icon><Plus /></el-icon>新增用户
        </el-button>
        <el-button type="danger" :disabled="!selectedRows.length" @click="handleBatchDelete">
          <el-icon><Delete /></el-icon>批量删除
        </el-button>
      </div>

      <el-table
        :data="tableData"
        v-loading="loading"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)">{{ row.role }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === '启用' ? 'success' : 'danger'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="120" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openDialog(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[5, 10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="userForm" :rules="formRules" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="userForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色" style="width: 100%;">
            <el-option label="管理员" value="管理员" />
            <el-option label="编辑" value="编辑" />
            <el-option label="访客" value="访客" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio value="启用">启用</el-radio>
            <el-radio value="禁用">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserList, addUser, updateUser, deleteUser } from '@/api/user'

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref([])
const selectedRows = ref([])

const searchForm = reactive({ keyword: '', status: '' })
const pagination = reactive({ page: 1, pageSize: 5, total: 0 })

const dialogVisible = ref(false)
const dialogTitle = ref('新增用户')
const formRef = ref()
const userForm = reactive({
  id: null,
  name: '',
  phone: '',
  email: '',
  role: '',
  status: '启用'
})

const formRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

function getRoleType(role) {
  const map = { 管理员: 'danger', 编辑: 'warning', 访客: 'info' }
  return map[role] || 'info'
}

async function fetchData() {
  loading.value = true
  try {
    const res = await getUserList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword
    })
    let filteredData = res.data
    if (searchForm.status) {
      filteredData = filteredData.filter((item) => item.status === searchForm.status)
      pagination.total = filteredData.length
    } else {
      pagination.total = res.total
    }
    tableData.value = filteredData
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchData()
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.status = ''
  pagination.page = 1
  fetchData()
}

function handleSelectionChange(rows) {
  selectedRows.value = rows
}

function openDialog(row) {
  if (row) {
    dialogTitle.value = '编辑用户'
    Object.assign(userForm, row)
  } else {
    dialogTitle.value = '新增用户'
    Object.assign(userForm, {
      id: null,
      name: '',
      phone: '',
      email: '',
      role: '',
      status: '启用'
    })
  }
  dialogVisible.value = true
}

function resetForm() {
  formRef.value && formRef.value.resetFields()
  Object.assign(userForm, {
    id: null,
    name: '',
    phone: '',
    email: '',
    role: '',
    status: '启用'
  })
}

async function handleSubmit() {
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      if (userForm.id) {
        await updateUser({ ...userForm })
        ElMessage.success('修改成功')
      } else {
        await addUser({ ...userForm })
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
      fetchData()
    } finally {
      submitLoading.value = false
    }
  })
}

function handleDelete(row) {
  ElMessageBox.confirm(`确定删除用户「${row.name}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    fetchData()
  }).catch(() => {})
}

function handleBatchDelete() {
  ElMessageBox.confirm(`确定删除选中的 ${selectedRows.value.length} 条数据吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    for (const row of selectedRows.value) {
      await deleteUser(row.id)
    }
    ElMessage.success('批量删除成功')
    fetchData()
  }).catch(() => {})
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.search-card {
  margin-bottom: 15px;
}

.search-card :deep(.el-card__body) {
  padding-bottom: 2px;
}

.table-header {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
}

.pagination {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}
</style>