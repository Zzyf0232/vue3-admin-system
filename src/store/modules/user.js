import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

  const isLogin = computed(() => !!token.value)

  function setToken(val) {
    token.value = val
    localStorage.setItem('token', val)
  }

  function setUserInfo(val) {
    userInfo.value = val
    localStorage.setItem('userInfo', JSON.stringify(val))
  }

  function login(loginData) {
    if (loginData.username === 'zhangyufei' && loginData.password === '123456') {
      const mockToken = 'mock_token_' + Date.now()
      const mockUserInfo = {
        name: '管理员',
        avatar: '',
        role: 'admin'
      }
      setToken(mockToken)
      setUserInfo(mockUserInfo)
      return true
    }
    return false
  }

  function logout() {
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return {
    token,
    userInfo,
    isLogin,
    setToken,
    setUserInfo,
    login,
    logout
  }
})
