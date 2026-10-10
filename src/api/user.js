const mockUsers = [
  { id: 1, name: '张三', phone: '13800138001', email: 'zhangsan@qq.com', role: '管理员', status: '启用', createTime: '2024-01-15' },
  { id: 2, name: '李四', phone: '13800138002', email: 'lisi@qq.com', role: '编辑', status: '启用', createTime: '2024-02-20' },
  { id: 3, name: '王五', phone: '13800138003', email: 'wangwu@qq.com', role: '访客', status: '禁用', createTime: '2024-03-10' },
  { id: 4, name: '赵六', phone: '13800138004', email: 'zhaoliu@qq.com', role: '编辑', status: '启用', createTime: '2024-04-05' },
  { id: 5, name: '孙七', phone: '13800138005', email: 'sunqi@qq.com', role: '访客', status: '启用', createTime: '2024-05-18' },
  { id: 6, name: '周八', phone: '13800138006', email: 'zhouba@qq.com', role: '管理员', status: '禁用', createTime: '2024-06-22' },
  { id: 7, name: '吴九', phone: '13800138007', email: 'wujiu@qq.com', role: '编辑', status: '启用', createTime: '2024-07-01' },
  { id: 8, name: '郑十', phone: '13800138008', email: 'zhengshi@qq.com', role: '访客', status: '启用', createTime: '2024-08-15' }
]

export function getUserList(params = { page: 1, pageSize: 5 }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { page, pageSize, keyword } = params
      let list = [...mockUsers]
      if (keyword) {
        list = list.filter(
          (item) => item.name.includes(keyword) || item.phone.includes(keyword)
        )
      }
      const total = list.length
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const data = list.slice(start, end)
      resolve({ data, total })
    }, 300)
  })
}

export function addUser(userData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newUser = {
        ...userData,
        id: mockUsers.length + 1,
        createTime: new Date().toISOString().split('T')[0]
      }
      mockUsers.unshift(newUser)
      resolve({ success: true })
    }, 300)
  })
}

export function updateUser(userData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockUsers.findIndex((item) => item.id === userData.id)
      if (index !== -1) {
        mockUsers[index] = { ...mockUsers[index], ...userData }
      }
      resolve({ success: true })
    }, 300)
  })
}

export function deleteUser(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockUsers.findIndex((item) => item.id === id)
      if (index !== -1) {
        mockUsers.splice(index, 1)
      }
      resolve({ success: true })
    }, 300)
  })
}