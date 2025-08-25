import api from './api'

export const authService = {
  async login (email, password) {
    const response = await api.post('/auth/login', { email, password })
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  async register (userData) {
    const response = await api.post('/auth/register', userData)
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  async getProfile () {
    const response = await api.get('/auth/me')
    return response.data.user
  },

  async updateProfile (userData) {
    const response = await api.put('/auth/profile', userData)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    return response.data
  },

  async changePassword (currentPassword, newPassword) {
    const response = await api.put('/auth/password', {
      currentPassword,
      newPassword
    })
    return response.data
  },

  logout () {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  },

  isAuthenticated () {
    return !!localStorage.getItem('auth_token')
  },

  getCurrentUser () {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }
}

export default authService
